import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
    stages: [
        { duration: '2m', target: 100 }, // Ramp up to 100 users
        { duration: '5m', target: 100 }, // Stay at 100 users
        { duration: '2m', target: 200 }, // Ramp up to 200 users
        { duration: '5m', target: 200 }, // Stay at 200 users
        { duration: '2m', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
        'http_req_failed': ['rate<0.1'],    // http errors should be less than 10%
        'errors': ['rate<0.1'],             // custom errors should be less than 10%
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function() {
    // Task submission test
    const taskPayload = {
        type: 'inference',
        model: 'test-model',
        input: {
            data: 'test-data'
        }
    };

    const submitTask = http.post(`${BASE_URL}/api/tasks`, JSON.stringify(taskPayload), {
        headers: { 'Content-Type': 'application/json' }
    });

    check(submitTask, {
        'task submission successful': (r) => r.status === 200,
        'task id received': (r) => JSON.parse(r.body).taskId !== undefined,
    }) || errorRate.add(1);

    sleep(1);

    // Node registration test
    const nodePayload = {
        type: 'edge',
        capabilities: ['gpu', 'cpu'],
        resources: {
            gpu: '8GB',
            cpu: '4cores',
            memory: '16GB'
        }
    };

    const registerNode = http.post(`${BASE_URL}/api/nodes`, JSON.stringify(nodePayload), {
        headers: { 'Content-Type': 'application/json' }
    });

    check(registerNode, {
        'node registration successful': (r) => r.status === 200,
        'node id received': (r) => JSON.parse(r.body).nodeId !== undefined,
    }) || errorRate.add(1);

    sleep(1);

    // Task status check
    if (submitTask.status === 200) {
        const taskId = JSON.parse(submitTask.body).taskId;
        const taskStatus = http.get(`${BASE_URL}/api/tasks/${taskId}`);

        check(taskStatus, {
            'status check successful': (r) => r.status === 200,
            'status is valid': (r) => ['pending', 'processing', 'completed', 'failed'].includes(JSON.parse(r.body).status),
        }) || errorRate.add(1);
    }

    sleep(1);
}
