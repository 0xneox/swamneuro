import { atom, selector } from 'recoil';
import computeService from './computeService';

const DEFAULT_TASK_STATE = {
  activeTasks: [],
  completedTasks: [],
  totalEarnings: 0,
  performance: {
    successRate: 100,
    avgCompletionTime: 0
  }
};

export const taskListState = atom({
  key: 'taskListState',
  default: []
});

export const activeTaskState = atom({
  key: 'activeTaskState',
  default: null
});

export const taskStatsState = atom({
  key: 'taskStatsState',
  default: DEFAULT_TASK_STATE
});

export const tasksState = atom({
  key: 'tasksState',
  default: []
});

export const selectedTaskState = atom({
  key: 'selectedTaskState',
  default: null
});

export const filteredTasksState = selector({
  key: 'filteredTasksState',
  get: ({get}) => {
    const tasks = get(tasksState);
    const selectedTask = get(selectedTaskState);
    return selectedTask ? tasks.filter(task => task.id === selectedTask) : tasks;
  }
});

class TaskService {
  constructor() {
    this.computeService = computeService;
    this._state = DEFAULT_TASK_STATE;
    this.initialized = false;
    this.tasks = [];
    this.activeTask = null;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await this.computeService.initialize();
      await this.fetchAvailableTasks();
      this.initialized = true;
      
      // Start task processing loop
      this.startTaskProcessing();
    } catch (error) {
      console.error('Failed to initialize task service:', error);
      throw error;
    }
  }

  async startTaskProcessing() {
    while (true) {
      if (!this.activeTask) {
        const availableTasks = await this.fetchAvailableTasks();
        if (availableTasks.length > 0) {
          this.activeTask = availableTasks[0];
          this._state = {
            ...this._state,
            activeTasks: [this.activeTask]
          };
        }
      }

      if (this.activeTask) {
        try {
          console.log('Processing task:', this.activeTask);
          const result = await this.computeService.executeTask(this.activeTask);
          await this.submitTaskResult(this.activeTask.id, result);
          
          this._state = {
            ...this._state,
            completedTasks: [...this._state.completedTasks, this.activeTask],
            totalEarnings: this._state.totalEarnings + this.activeTask.reward
          };
          
          this.activeTask = null;
        } catch (error) {
          console.error('Error processing task:', error);
          this.activeTask = null;
        }
      }

      // Wait before checking for new tasks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  getState() {
    return this._state;
  }

  async fetchAvailableTasks() {
    try {
      const response = await fetch('http://localhost:8080/api/tasks', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const tasks = await response.json();
      this.tasks = tasks;
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async submitTaskResult(taskId, result) {
    try {
      const response = await fetch('http://localhost:8080/api/tasks/submit', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          result
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting task result:', error);
      throw error;
    }
  }
}

const taskService = new TaskService();

// Initialize the service
taskService.initialize().catch(console.error);

export default taskService;
