import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DeepseekAPI } from './apis/deepseek';
import { taskPipeline } from './taskPipeline';
import { deviceCapabilities } from '../utils/deviceCheck';

class AITaskGenerator {
  constructor() {
    this.openai = new OpenAI();
    this.gemini = new GoogleGenerativeAI();
    this.deepseek = new DeepseekAPI();
    
    // Task types that can run on different device capabilities
    this.taskTypes = {
      webgpu: ['inference', 'training', 'finetuning'],
      webgl: ['inference', 'lightweight-training'],
      cpu: ['text-processing', 'data-preparation', 'validation']
    };
  }

  async generateTasks() {
    // Get tasks from multiple AI providers
    const [openaiTasks, geminiTasks, deepseekTasks] = await Promise.all([
      this.getOpenAITasks(),
      this.getGeminiTasks(),
      this.getDeepseekTasks()
    ]);

    return [...openaiTasks, ...geminiTasks, ...deepseekTasks];
  }

  async getOpenAITasks() {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Generate distributed AI tasks for processing"
      }]
    });

    return this.formatTasks(completion.choices[0].message.content, 'openai');
  }

  async getGeminiTasks() {
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Generate AI tasks for distributed processing");
    return this.formatTasks(result.response.text(), 'gemini');
  }

  async getDeepseekTasks() {
    const tasks = await this.deepseek.generateTasks();
    return this.formatTasks(tasks, 'deepseek');
  }

  formatTasks(rawTasks, provider) {
    // Convert raw tasks into standardized format
    return rawTasks.map(task => ({
      id: `${provider}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider,
      type: task.type,
      input: task.input,
      requirements: {
        minCompute: task.minCompute,
        minMemory: task.minMemory,
        estimatedTime: task.estimatedTime
      },
      reward: this.calculateReward(task)
    }));
  }

  calculateReward(task) {
    const baseReward = 10; // Base NEURO tokens
    const complexityMultiplier = task.complexity || 1;
    const urgencyMultiplier = task.urgent ? 1.5 : 1;
    
    return baseReward * complexityMultiplier * urgencyMultiplier;
  }

  async assignTask(deviceCapabilities) {
    const tasks = await this.generateTasks();
    const compatibleTasks = this.filterCompatibleTasks(tasks, deviceCapabilities);
    
    if (compatibleTasks.length === 0) {
      return this.getFallbackTask(deviceCapabilities);
    }

    return this.selectOptimalTask(compatibleTasks, deviceCapabilities);
  }

  filterCompatibleTasks(tasks, capabilities) {
    return tasks.filter(task => {
      if (capabilities.webgpu) {
        return true; // Can run any task
      }
      if (capabilities.webgl && this.taskTypes.webgl.includes(task.type)) {
        return true;
      }
      if (this.taskTypes.cpu.includes(task.type)) {
        return true;
      }
      return false;
    });
  }

  async getFallbackTask(capabilities) {
    // Generate CPU-friendly tasks for devices without WebGPU
    const fallbackTasks = {
      'data-preparation': {
        type: 'data-preparation',
        description: 'Preprocess and clean training data',
        reward: 5
      },
      'validation': {
        type: 'validation',
        description: 'Validate model outputs',
        reward: 3
      },
      'text-processing': {
        type: 'text-processing',
        description: 'Process and tokenize text data',
        reward: 4
      }
    };

    // Select appropriate fallback task based on device capabilities
    if (capabilities.webgl) {
      return {
        ...fallbackTasks['data-preparation'],
        processor: 'webgl'
      };
    }

    return {
      ...fallbackTasks['text-processing'],
      processor: 'cpu'
    };
  }

  selectOptimalTask(tasks, capabilities) {
    // Score tasks based on device capabilities and rewards
    const scoredTasks = tasks.map(task => ({
      ...task,
      score: this.calculateTaskScore(task, capabilities)
    }));

    // Return task with highest score
    return scoredTasks.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  calculateTaskScore(task, capabilities) {
    let score = task.reward;

    // Adjust score based on device capabilities
    if (capabilities.webgpu && task.type === 'training') {
      score *= 1.5;
    }
    if (capabilities.webgl && task.type === 'inference') {
      score *= 1.2;
    }

    return score;
  }
}

export const aiTaskGenerator = new AITaskGenerator();
