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
const port = process.env.PORT || process.env.COMPUTE_PORT || 13002;

// Mock data for development
const mockComputeNodes = [
  {
    id: 'node1',
    status: 'active',
    performance: {
      tflops: 5.2,
      gpuMemory: 8192,
      utilizationPercent: 75
    },
    tasks: ['task1', 'task2']
  },
  {
    id: 'node2',
    status: 'active',
    performance: {
      tflops: 3.8,
      gpuMemory: 6144,
      utilizationPercent: 60
    },
    tasks: ['task3']
  }
];

// Track compute nodes and their tasks
const computeNodes = new Map(mockComputeNodes.map(node => [node.id, node]));
const activeTasks = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Get all compute tasks
app.get('/api/compute/tasks', (req, res) => {
  res.json(Array.from(activeTasks.values()));
});

// Submit new compute task
app.post('/api/compute/submit', (req, res) => {
  const { type, input, config } = req.body;

  if (!type || !input) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const taskId = Math.random().toString(36).substring(7);
  const task = {
    id: taskId,
    type,
    input,
    config,
    status: 'submitted',
    submittedAt: Date.now()
  };

  activeTasks.set(taskId, task);
  
  // Assign to least loaded node
  const availableNodes = Array.from(computeNodes.values())
    .filter(node => node.status === 'active')
    .sort((a, b) => a.performance.utilizationPercent - b.performance.utilizationPercent);

  if (availableNodes.length > 0) {
    const node = availableNodes[0];
    task.assignedNode = node.id;
    task.status = 'processing';
    node.tasks.push(taskId);
  }

  res.json(task);
});

// Get compute task status
app.get('/api/compute/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = activeTasks.get(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Get compute nodes status
app.get('/api/compute/nodes', (req, res) => {
  res.json({
    totalNodes: computeNodes.size,
    activeNodes: Array.from(computeNodes.values()).filter(n => n.status === 'active').length,
    nodes: Array.from(computeNodes.values())
  });
});

// Update node status
app.post('/api/compute/nodes/:nodeId/status', (req, res) => {
  const { nodeId } = req.params;
  const { status, performance } = req.body;

  const node = computeNodes.get(nodeId);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  node.status = status;
  if (performance) {
    node.performance = { ...node.performance, ...performance };
  }

  res.json(node);
});

// Get compute statistics
app.get('/api/compute/stats', (req, res) => {
  const nodes = Array.from(computeNodes.values());
  const activeNodes = nodes.filter(n => n.status === 'active');

  res.json({
    totalNodes: nodes.length,
    activeNodes: activeNodes.length,
    totalTflops: activeNodes.reduce((sum, node) => sum + node.performance.tflops, 0),
    averageUtilization: activeNodes.reduce((sum, node) => sum + node.performance.utilizationPercent, 0) / activeNodes.length,
    activeTasks: activeTasks.size
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    nodes: {
      total: computeNodes.size,
      active: Array.from(computeNodes.values()).filter(n => n.status === 'active').length
    },
    tasks: activeTasks.size
  });
});

app.listen(port, () => {
  console.log(`Compute service running on port ${port}`);
});
