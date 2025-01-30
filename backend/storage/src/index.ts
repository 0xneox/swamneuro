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
  res.json({ status: 'healthy', nodeType: 'storage' });
});

// Store data endpoint
app.post('/store', async (req, res) => {
  try {
    const { data } = req.body;
    
    // Store the data
    const storageId = await storeData(data);
    
    res.json({ 
      storageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve data endpoint
app.get('/retrieve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Retrieve the data
    const data = await retrieveData(id);
    
    res.json({ 
      id,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function storeData(data: any): Promise<string> {
  // Implement data storage logic
  const id = `storage-${Date.now()}`;
  await redis.set(id, JSON.stringify(data));
  return id;
}

async function retrieveData(id: string): Promise<any> {
  // Implement data retrieval logic
  const data = await redis.get(id);
  return data ? JSON.parse(data) : null;
}

app.listen(port, () => {
  console.log(`Storage node listening on port ${port}`);
});
