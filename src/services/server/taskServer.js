import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || process.env.TASK_PORT || 13003;

// Task queue and management
const taskQueue = [];
const activeTasks = new Map();
const completedTasks = new Map();

// Mock data for development
const mockTasks = [
  {
    id: 'task1',
    type: 'inference',
    input: 'sample-input-1',
    status: 'completed',
    createdAt: Date.now() - 3600000,
    completedAt: Date.now() - 1800000,
    result: { accuracy: 0.95 }
  },
  {
    id: 'task2',
    type: 'training',
    input: 'sample-input-2',
    status: 'processing',
    createdAt: Date.now() - 1800000
  }
];

// Initialize with mock data
mockTasks.forEach(task => {
  if (task.status === 'completed') {
    completedTasks.set(task.id, task);
  } else if (task.status === 'processing') {
    activeTasks.set(task.id, task);
  } else {
    taskQueue.push(task);
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const allTasks = [
    ...Array.from(completedTasks.values()),
    ...Array.from(activeTasks.values()),
    ...taskQueue
  ];
  
  res.json(allTasks);
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { type, input, priority = 1 } = req.body;

  if (!type || !input) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const taskId = Math.random().toString(36).substring(7);
  const task = {
    id: taskId,
    type,
    input,
    priority,
    status: 'queued',
    createdAt: Date.now()
  };

  taskQueue.push(task);
  res.json(task);
});

// Get next available task
app.get('/api/tasks/next', (req, res) => {
  if (taskQueue.length === 0) {
    return res.status(404).json({ error: 'No tasks available' });
  }

  const task = taskQueue.shift();
  task.status = 'processing';
  task.startedAt = Date.now();
  activeTasks.set(task.id, task);

  res.json(task);
});

// Update task status
app.post('/api/tasks/:taskId/status', (req, res) => {
  const { taskId } = req.params;
  const { status, result } = req.body;

  const task = activeTasks.get(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.status = status;
  if (status === 'completed') {
    task.completedAt = Date.now();
    task.result = result;
    completedTasks.set(taskId, task);
    activeTasks.delete(taskId);
  }

  res.json(task);
});

// Get task status
app.get('/api/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  
  const task = 
    activeTasks.get(taskId) || 
    completedTasks.get(taskId) || 
    taskQueue.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Get task statistics
app.get('/api/tasks/stats', (req, res) => {
  res.json({
    queued: taskQueue.length,
    active: activeTasks.size,
    completed: completedTasks.size,
    totalTasks: taskQueue.length + activeTasks.size + completedTasks.size,
    successRate: calculateSuccessRate()
  });
});

function calculateSuccessRate() {
  const total = completedTasks.size;
  if (total === 0) return 100;
  
  const successful = Array.from(completedTasks.values())
    .filter(task => task.result && task.result.accuracy > 0.8)
    .length;
    
  return (successful / total) * 100;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    tasks: {
      queued: taskQueue.length,
      active: activeTasks.size,
      completed: completedTasks.size
    }
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Task service running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
