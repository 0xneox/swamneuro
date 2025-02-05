import { detect } from 'detect-browser';
import { getDeviceType } from '../utils/deviceDetection';

class LightNodeService {
    constructor() {
        this.capabilities = null;
        this.metrics = {
            tasksCompleted: 0,
            uptime: 0,
            successRate: 100,
            participationStreak: 0
        };
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        this.capabilities = await this.detectCapabilities();
        await this.registerDevice();
        this.startHeartbeat();
        this.beginTaskPolling();
        
        this.isInitialized = true;
    }

    async detectCapabilities() {
        const browser = detect();
        const deviceType = getDeviceType();
        
        return {
            browser: {
                name: browser.name,
                version: browser.version,
                os: browser.os
            },
            device: {
                type: deviceType,
                isMobile: deviceType === 'mobile' || deviceType === 'tablet',
                hasTouch: 'ontouchstart' in window
            },
            webgpu: await this.checkWebGPUSupport(),
            performance: await this.measurePerformance()
        };
    }

    async checkWebGPUSupport() {
        if (!navigator.gpu) return false;
        
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return false;
            
            const device = await adapter.requestDevice();
            return !!device;
        } catch (error) {
            console.warn('WebGPU not supported:', error);
            return false;
        }
    }

    async measurePerformance() {
        // Basic performance measurements
        const memory = navigator?.deviceMemory || 4; // Default to 4GB if not available
        const cores = navigator?.hardwareConcurrency || 2;
        
        // Run a simple benchmark
        const startTime = performance.now();
        let operations = 0;
        while (performance.now() - startTime < 100) {
            // Simple floating-point operations
            Math.sin(operations++) * Math.cos(operations);
        }
        
        return {
            memory,
            cores,
            operationsPerSecond: operations * 10,
            score: (operations * memory * cores) / 1000
        };
    }

    async registerDevice() {
        try {
            const response = await fetch('/api/light-node/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    capabilities: this.capabilities,
                    metrics: this.metrics
                })
            });
            
            if (!response.ok) {
                throw new Error(`Registration failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.nodeId = data.nodeId;
        } catch (error) {
            console.error('Failed to register light node:', error);
            throw error;
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/light-node/${this.nodeId}/heartbeat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        metrics: this.metrics,
                        timestamp: Date.now()
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Heartbeat failed: ${response.statusText}`);
                }
            } catch (error) {
                console.warn('Heartbeat failed:', error);
            }
        }, 30000); // Every 30 seconds
    }

    beginTaskPolling() {
        this.taskInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/light-node/${this.nodeId}/tasks`);
                if (!response.ok) {
                    throw new Error(`Task polling failed: ${response.statusText}`);
                }
                
                const tasks = await response.json();
                for (const task of tasks) {
                    this.processTask(task);
                }
            } catch (error) {
                console.warn('Task polling failed:', error);
            }
        }, 5000); // Every 5 seconds
    }

    async processTask(task) {
        try {
            console.log('Processing task:', task);
            
            // Check if we can handle this task
            if (!this.canHandleTask(task)) {
                await this.requestTaskReassignment(task);
                return;
            }
            
            // Execute the task
            const result = await this.executeTask(task);
            
            // Submit the result
            await this.submitResult(task.id, result);
            
            // Update metrics
            this.metrics.tasksCompleted++;
        } catch (error) {
            console.error('Task processing failed:', error);
            this.metrics.successRate = (this.metrics.tasksCompleted / (this.metrics.tasksCompleted + 1)) * 100;
        }
    }

    canHandleTask(task) {
        // Check if the task requirements match our capabilities
        return (
            (!task.requiresWebGPU || this.capabilities.webgpu) &&
            task.complexity <= this.capabilities.performance.score &&
            (!task.mobileOnly || this.capabilities.device.isMobile)
        );
    }

    async executeTask(task) {
        if (task.type === 'webgpu' && this.capabilities.webgpu) {
            return this.executeViaWebGPU(task);
        }
        return this.executeViaWebWorker(task);
    }

    async executeViaWebGPU(task) {
        // WebGPU implementation
        const adapter = await navigator.gpu.requestAdapter();
        const device = await adapter.requestDevice();
        
        // Task-specific WebGPU code would go here
        // This is just a placeholder
        return { success: true, result: 'WebGPU result' };
    }

    async executeViaWebWorker(task) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('/workers/task-worker.js');
            
            worker.onmessage = (event) => {
                worker.terminate();
                resolve(event.data);
            };
            
            worker.onerror = (error) => {
                worker.terminate();
                reject(error);
            };
            
            worker.postMessage(task);
        });
    }

    async submitResult(taskId, result) {
        const response = await fetch(`/api/light-node/${this.nodeId}/tasks/${taskId}/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        });
        
        if (!response.ok) {
            throw new Error(`Result submission failed: ${response.statusText}`);
        }
        
        return response.json();
    }

    async requestTaskReassignment(task) {
        const response = await fetch(`/api/light-node/${this.nodeId}/tasks/${task.id}/reassign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reason: 'Insufficient capabilities',
                capabilities: this.capabilities
            })
        });
        
        if (!response.ok) {
            throw new Error(`Task reassignment failed: ${response.statusText}`);
        }
    }

    cleanup() {
        clearInterval(this.heartbeatInterval);
        clearInterval(this.taskInterval);
    }
}

export const lightNodeService = new LightNodeService();
export default lightNodeService;
