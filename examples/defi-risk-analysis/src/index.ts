import express from 'express';
import axios from 'axios';
import { Connection } from '@solana/web3.js';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';

if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

// Initialize Solana connection
const connection = new Connection(SOLANA_RPC);

interface RiskAnalysisRequest {
  type: 'defi-risk';
  model: string;
  input: {
    protocol: string;
    address: string;
    chainData: Record<string, unknown>;
    metrics: {
      tvl: number;
      volume24h: number;
      apy: number;
      [key: string]: unknown;
    };
  };
}

interface RiskAnalysisResponse {
  taskId: string;
  status: string;
}

async function analyzeProtocolRisk(request: RiskAnalysisRequest): Promise<RiskAnalysisResponse> {
  try {
    const response = await axios.post(`${GATEWAY_URL}/api/tasks`, {
      task: request
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

async function checkTaskStatus(taskId: string): Promise<string> {
  try {
    const response = await axios.get(`${GATEWAY_URL}/api/tasks/${taskId}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    return response.data.status;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Status check failed: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

app.use(express.json());

app.post('/analyze', async (req, res) => {
  try {
    const { protocol, address } = req.body;

    const riskRequest: RiskAnalysisRequest = {
      type: 'defi-risk',
      model: 'risk-analysis-v1',
      input: {
        protocol,
        address,
        chainData: {
          blockHeight: await connection.getSlot(),
          timestamp: new Date().toISOString()
        },
        metrics: {
          tvl: 1000000, // $1M TVL
          volume24h: 500000, // $500k 24h volume
          apy: 12.5 // 12.5% APY
        }
      }
    };

    const response = await analyzeProtocolRisk(riskRequest);
    res.json(response);

    // Poll for task status
    let status = await checkTaskStatus(response.taskId);
    console.log('Initial status:', status);

    while (status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      status = await checkTaskStatus(response.taskId);
      console.log('Updated status:', status);
    }

    console.log('Final status:', status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`DeFi Risk Analysis API listening on port ${port}`);
});
