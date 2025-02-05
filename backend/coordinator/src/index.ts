import express from 'express';
import { Connection } from '@solana/web3.js';
import Redis from 'ioredis';

const app = express();
const port = process.env.PORT || 3000;

// Initialize Solana connection
const connection = new Connection(process.env.TESTNET_RPC_URL || 'https://api.devnet.solana.com');

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', nodeType: 'coordinator' });
});

// Task distribution endpoint
app.post('/distribute', async (req, res) => {
  try {
    const { task } = req.body;
    
    // Distribute task to validators
    const distribution = await distributeTask(task);
    
    res.json({ 
      taskId: distribution.taskId,
      validators: distribution.validators,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function distributeTask(task: any): Promise<any> {
  // Implement task distribution logic
  return {
    taskId: 'task-123',
    validators: ['validator-1', 'validator-2']
  };
}

app.listen(port, () => {
  console.log(`Coordinator node listening on port ${port}`);
});
