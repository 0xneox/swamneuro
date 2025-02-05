import { NeurolovNetwork } from '../../src/network';
import { Task } from '../../src/task';
import { performance } from 'perf_hooks';
import cluster from 'cluster';
import os from 'os';

const NUM_WORKERS = os.cpus().length;
const TASKS_PER_WORKER = 1000;
const DURATION = 300000; // 5 minutes

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }

    let completedWorkers = 0;
    let totalTasks = 0;
    let totalErrors = 0;
    let totalLatency = 0;

    cluster.on('message', (worker, message) => {
        if (message.type === 'result') {
            totalTasks += message.tasksCompleted;
            totalErrors += message.errors;
            totalLatency += message.averageLatency;
            completedWorkers++;

            if (completedWorkers === NUM_WORKERS) {
                const averageLatency = totalLatency / NUM_WORKERS;
                const errorRate = (totalErrors / totalTasks) * 100;

                console.log('Stress Test Results:');
                console.log('-------------------');
                console.log(`Total Tasks: ${totalTasks}`);
                console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
                console.log(`Average Latency: ${averageLatency.toFixed(2)}ms`);
                console.log(`Tasks/Second: ${(totalTasks / (DURATION / 1000)).toFixed(2)}`);

                process.exit(0);
            }
        }
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    console.log(`Worker ${process.pid} started`);

    async function runWorker() {
        const network = new NeurolovNetwork({
            environment: 'stress-test',
            networkId: `stress-${process.pid}`
        });

        let tasksCompleted = 0;
        let errors = 0;
        let totalLatency = 0;

        const startTime = performance.now();

        while (performance.now() - startTime < DURATION) {
            try {
                const taskStartTime = performance.now();

                // Create and submit task
                const task = new Task({
                    type: 'inference',
                    model: 'stress-test-model',
                    input: {
                        data: `test-data-${process.pid}-${tasksCompleted}`
                    }
                });

                const result = await network.submitTask(task);
                await network.waitForTask(result.taskId, {
                    timeout: 5000 // 5 seconds timeout
                });

                const taskEndTime = performance.now();
                totalLatency += taskEndTime - taskStartTime;
                tasksCompleted++;
            } catch (error) {
                errors++;
                console.error(`Worker ${process.pid} error:`, error.message);
            }
        }

        const averageLatency = totalLatency / tasksCompleted;

        // Send results to primary
        process.send({
            type: 'result',
            tasksCompleted,
            errors,
            averageLatency
        });

        await network.shutdown();
        process.exit(0);
    }

    runWorker().catch(error => {
        console.error(`Worker ${process.pid} fatal error:`, error);
        process.exit(1);
    });
}

// Usage:
// NODE_ENV=test ts-node tests/stress/network-stress.test.ts
