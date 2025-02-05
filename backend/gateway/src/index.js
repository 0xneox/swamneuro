import express from 'express';
import { Connection } from '@solana/web3.js';
import Redis from 'ioredis';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from 'dotenv';
import cors from 'cors';
import { scheduleTaskGeneration, submitTaskResult } from './services/taskGenerator.js';
import { DeviceManager } from './services/deviceManager.js';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize Solana connection
const connection = new Connection(process.env.TESTNET_RPC_URL || 'https://api.devnet.solana.com');

// Redis setup
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Initialize Device Manager
const deviceManager = new DeviceManager(redis);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'gateway',
    timestamp: new Date().toISOString()
  });
});

// Device routes
app.post('/api/devices/register', async (req, res) => {
  try {
    console.log('Registering device with info:', JSON.stringify(req.body, null, 2));
    const deviceInfo = req.body;
    
    if (!deviceInfo.walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const device = await deviceManager.registerDevice(deviceInfo);
    console.log('Device registered successfully:', JSON.stringify(device, null, 2));
    res.json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

app.get('/api/devices/:deviceId', async (req, res) => {
  try {
    const device = await deviceManager.getDeviceInfo(req.params.deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Failed to fetch device info' });
  }
});

app.get('/api/devices/:deviceId/stats', async (req, res) => {
  try {
    const stats = await deviceManager.getDeviceStats(req.params.deviceId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({ error: 'Failed to fetch device stats' });
  }
});

// Handle preflight requests
app.options('*', cors());

// Dashboard routes
app.get('/api/dashboard/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const stats = await deviceManager.getWalletStats(walletAddress);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

app.get('/api/devices/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const devices = await deviceManager.listDevices(walletAddress);
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Stats routes
app.get('/api/stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    console.log(`Fetching stats for wallet: ${walletAddress}`);
    
    const stats = await deviceManager.getWalletStats(walletAddress);
    console.log('Stats retrieved:', JSON.stringify(stats, null, 2));
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    res.status(500).json({ error: 'Failed to fetch wallet stats' });
  }
});

app.get('/api/stats/network', async (req, res) => {
  try {
    console.log('Fetching network stats');
    const stats = await deviceManager.getNetworkStats();
    console.log('Network stats retrieved:', JSON.stringify(stats, null, 2));
    res.json(stats);
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({ error: 'Failed to fetch network stats' });
  }
});

// Task routes
app.get('/api/tasks', async (_req, res) => {
  console.log('Fetching available tasks...');
  try {
    const taskIds = await redis.smembers('tasks:available');
    console.log('Found task IDs:', taskIds);

    const tasks = await Promise.all(
      taskIds.map(async (id) => {
        console.log('Fetching task details for:', id);
        const task = await redis.hgetall(`task:${id}`);
        if (task.data) {
          task.data = JSON.parse(task.data);
        }
        return task;
      })
    );
    
    console.log('Returning tasks:', tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await redis.hget('task_details', taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(JSON.parse(task));
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ error: 'Failed to fetch task details' });
  }
});

app.post('/api/tasks/submit', async (req, res) => {
  try {
    const { taskId, result, walletAddress } = req.body;
    
    if (!taskId || !result || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = await submitTaskResult(redis, taskId, result, walletAddress);
    res.json(submission);
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:taskId/submit', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { deviceId, result } = req.body;
    
    await deviceManager.completeTask(deviceId, taskId, result);
    res.json({ message: 'Task completed successfully' });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Earnings routes
app.get('/api/earnings/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const devices = await deviceManager.listDevices();
    const userDevices = devices.filter(device => device.walletAddress === walletAddress);
    
    const earnings = {
      total: 0,
      history: [],
      devices: []
    };

    for (const device of userDevices) {
      const deviceStats = await deviceManager.getDeviceStats(device.id);
      earnings.total += deviceStats.totalEarnings;
      earnings.devices.push({
        id: device.id,
        name: device.name,
        earnings: deviceStats.totalEarnings,
        tasksCompleted: deviceStats.tasksCompleted
      });
    }

    // Get earnings history
    const history = await redis.lrange(`earnings:${walletAddress}`, 0, -1);
    earnings.history = history.map(JSON.parse);

    res.json(earnings);
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings data' });
  }
});

// Start task generation
console.log('Starting task generation service...');
scheduleTaskGeneration(redis).catch(error => {
  console.error('Failed to start task generation:', error);
});

// Start device cleanup
setInterval(() => deviceManager.cleanupOfflineDevices(), 60000); // Check every minute

app.listen(port, () => {
  console.log(`Gateway service running on port ${port}`);
});
