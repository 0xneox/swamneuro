import { expect } from 'chai';
import { NeurolovNetwork } from '../../src/network';
import { EdgeNode, ValidatorNode, CoordinatorNode } from '../../src/nodes';
import { Task } from '../../src/task';

describe('Neurolov Network Integration Tests', () => {
    let network: NeurolovNetwork;
    let edgeNode: EdgeNode;
    let validatorNode: ValidatorNode;
    let coordinatorNode: CoordinatorNode;

    before(async () => {
        network = new NeurolovNetwork({
            environment: 'test',
            networkId: 'test-network'
        });

        // Initialize nodes
        edgeNode = await EdgeNode.create({
            capabilities: ['gpu', 'cpu'],
            resources: {
                gpu: '8GB',
                cpu: '4cores',
                memory: '16GB'
            }
        });

        validatorNode = await ValidatorNode.create({
            stake: '10000',
            uptime: 0.99
        });

        coordinatorNode = await CoordinatorNode.create({
            stake: '50000',
            capacity: 1000
        });
    });

    describe('Node Registration', () => {
        it('should register edge node successfully', async () => {
            const result = await network.registerNode(edgeNode);
            expect(result.success).to.be.true;
            expect(result.nodeId).to.be.a('string');
        });

        it('should register validator node successfully', async () => {
            const result = await network.registerNode(validatorNode);
            expect(result.success).to.be.true;
            expect(result.nodeId).to.be.a('string');
        });

        it('should register coordinator node successfully', async () => {
            const result = await network.registerNode(coordinatorNode);
            expect(result.success).to.be.true;
            expect(result.nodeId).to.be.a('string');
        });
    });

    describe('Task Processing', () => {
        it('should process task through complete pipeline', async () => {
            // Create task
            const task = new Task({
                type: 'inference',
                model: 'test-model',
                input: { data: 'test-data' }
            });

            // Submit task
            const submitResult = await network.submitTask(task);
            expect(submitResult.taskId).to.be.a('string');

            // Wait for task completion
            const result = await network.waitForTask(submitResult.taskId, {
                timeout: 30000 // 30 seconds
            });

            expect(result.status).to.equal('completed');
            expect(result.output).to.exist;
        });

        it('should handle task failure gracefully', async () => {
            const task = new Task({
                type: 'inference',
                model: 'non-existent-model',
                input: { data: 'test-data' }
            });

            const submitResult = await network.submitTask(task);
            const result = await network.waitForTask(submitResult.taskId, {
                timeout: 30000
            });

            expect(result.status).to.equal('failed');
            expect(result.error).to.exist;
        });
    });

    describe('Node Coordination', () => {
        it('should distribute tasks efficiently', async () => {
            // Create multiple tasks
            const tasks = Array(10).fill(null).map(() => new Task({
                type: 'inference',
                model: 'test-model',
                input: { data: 'test-data' }
            }));

            // Submit all tasks
            const results = await Promise.all(
                tasks.map(task => network.submitTask(task))
            );

            // Wait for all tasks
            const completedTasks = await Promise.all(
                results.map(r => network.waitForTask(r.taskId, {
                    timeout: 30000
                }))
            );

            // Check distribution
            const nodeStats = await network.getNodeStats();
            expect(nodeStats.taskDistribution).to.be.approximately(1, 0.2); // Max 20% deviation
        });

        it('should handle node failure and recovery', async () => {
            // Simulate node failure
            await edgeNode.simulate('failure');

            // Submit task
            const task = new Task({
                type: 'inference',
                model: 'test-model',
                input: { data: 'test-data' }
            });

            const submitResult = await network.submitTask(task);
            const result = await network.waitForTask(submitResult.taskId, {
                timeout: 30000
            });

            expect(result.status).to.equal('completed');
            expect(result.nodeFailures).to.be.greaterThan(0);
        });
    });

    describe('Network Performance', () => {
        it('should maintain performance under load', async () => {
            const startTime = Date.now();
            const tasks = Array(100).fill(null).map(() => new Task({
                type: 'inference',
                model: 'test-model',
                input: { data: 'test-data' }
            }));

            const results = await Promise.all(
                tasks.map(task => network.submitTask(task))
            );

            const completedTasks = await Promise.all(
                results.map(r => network.waitForTask(r.taskId, {
                    timeout: 60000
                }))
            );

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).to.be.below(60000); // Should complete within 60 seconds
            expect(completedTasks.filter(t => t.status === 'completed').length)
                .to.equal(tasks.length);
        });
    });

    describe('Security', () => {
        it('should prevent unauthorized access', async () => {
            const maliciousNode = await EdgeNode.create({
                capabilities: ['gpu'],
                resources: {
                    gpu: '8GB',
                    cpu: '4cores',
                    memory: '16GB'
                }
            });

            try {
                await network.registerNode(maliciousNode, {
                    signature: 'invalid'
                });
                expect.fail('Should not register unauthorized node');
            } catch (error) {
                expect(error.message).to.include('unauthorized');
            }
        });

        it('should detect and handle malicious behavior', async () => {
            // Simulate malicious task
            const maliciousTask = new Task({
                type: 'inference',
                model: 'test-model',
                input: { data: 'malicious-data' }
            });

            try {
                await network.submitTask(maliciousTask);
                expect.fail('Should not accept malicious task');
            } catch (error) {
                expect(error.message).to.include('security');
            }
        });
    });

    after(async () => {
        // Cleanup
        await network.shutdown();
        await Promise.all([
            edgeNode.shutdown(),
            validatorNode.shutdown(),
            coordinatorNode.shutdown()
        ]);
    });
});
