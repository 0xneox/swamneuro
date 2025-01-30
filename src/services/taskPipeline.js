import { AIComputeEngine } from '../utils/webgpu';
import { swarmService } from './swarmService';
import { signMessage } from '../utils/crypto';

class TaskPipeline {
  constructor() {
    this.computeEngine = null;
    this.currentTask = null;
    this.taskQueue = [];
    this.isProcessing = false;
  }

  async initialize() {
    try {
      const { device } = await checkWebGPUSupport();
      this.computeEngine = new AIComputeEngine(device);
      await this.computeEngine.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize compute engine:', error);
      return false;
    }
  }

  async processTask(task) {
    if (!this.computeEngine) {
      throw new Error('Compute engine not initialized');
    }

    this.currentTask = task;
    
    try {
      // 1. Validate task requirements
      await this.validateTaskRequirements(task);

      // 2. Pre-process task data
      const processedData = await this.preprocessTaskData(task.data);

      // 3. Execute computation
      const result = await this.computeEngine.runInference(processedData);

      // 4. Validate result
      const validationResult = await this.validateResult(result);

      // 5. Get proof of work
      const proof = await this.generateProofOfWork(result);

      // 6. Sign result
      const signature = await signMessage(result);

      // 7. Submit to swarm leader
      await swarmService.submitTaskResult({
        taskId: task.id,
        result,
        proof,
        signature,
        metrics: {
          computeTime: performance.now() - task.startTime,
          deviceScore: await this.computeEngine.getDeviceScore()
        }
      });

      return true;
    } catch (error) {
      console.error('Task processing failed:', error);
      await this.handleTaskFailure(task, error);
      return false;
    } finally {
      this.currentTask = null;
    }
  }

  async validateTaskRequirements(task) {
    const deviceScore = await this.computeEngine.getDeviceScore();
    
    if (deviceScore.tflops < task.minTflops) {
      throw new Error('Device does not meet minimum compute requirements');
    }

    if (deviceScore.vram < task.minVram) {
      throw new Error('Device does not meet minimum memory requirements');
    }

    return true;
  }

  async preprocessTaskData(data) {
    // Convert input data to appropriate format
    return data;
  }

  async validateResult(result) {
    // Implement result validation logic
    return true;
  }

  async generateProofOfWork(result) {
    // Generate proof of work for the result
    const proof = {
      timestamp: Date.now(),
      deviceId: await this.computeEngine.getDeviceId(),
      computeScore: await this.computeEngine.getDeviceScore(),
      resultHash: await crypto.subtle.digest('SHA-256', result)
    };

    return proof;
  }

  async handleTaskFailure(task, error) {
    await swarmService.reportTaskFailure({
      taskId: task.id,
      error: error.message,
      deviceStats: await this.computeEngine.getDeviceScore()
    });
  }

  // Power management methods
  async startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    // Start processing tasks from queue
    while (this.taskQueue.length > 0 && this.isProcessing) {
      const task = this.taskQueue.shift();
      await this.processTask(task);
    }
  }

  async stopProcessing() {
    this.isProcessing = false;
    if (this.currentTask) {
      await this.handleTaskFailure(this.currentTask, new Error('Processing stopped by user'));
    }
  }

  // Queue management
  addTask(task) {
    this.taskQueue.push(task);
    if (this.isProcessing) {
      this.startProcessing();
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.taskQueue.length,
      currentTask: this.currentTask,
      isProcessing: this.isProcessing
    };
  }
}

export const taskPipeline = new TaskPipeline();
