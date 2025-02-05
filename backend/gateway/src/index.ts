import express from 'express';
import { Connection } from '@solana/web3.js';
import Redis from 'ioredis';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize Solana connection
const connection = new Connection(process.env.TESTNET_RPC_URL || 'https://api.devnet.solana.com');

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.TESTNET_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'gateway',
    timestamp: new Date().toISOString()
  });
});

// Protected routes
app.use('/api', validateApiKey);

interface Task {
  type: string;
  model: string;
  input: Record<string, unknown>;
}

interface TaskResult {
  taskId: string;
  status: string;
}

// Submit task endpoint
app.post('/api/tasks', async (req, res) => {
  try {
    const { task } = req.body as { task: Task };
    
    // Submit task to coordinator
    const result = await submitTask(task);
    
    res.json({ 
      taskId: result.taskId,
      status: 'submitted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get task status endpoint
app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Get task status
    const status = await getTaskStatus(taskId);
    
    res.json({ 
      taskId,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

async function submitTask(task: Task): Promise<TaskResult> {
  // TODO: Implement task submission logic
  // For now, just return a mock response
  return {
    taskId: `task-${Date.now()}`,
    status: 'submitted'
  };
}

async function getTaskStatus(taskId: string): Promise<string> {
  // TODO: Implement task status retrieval logic
  // For now, just return a mock status
  return 'processing';
}

app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
});
