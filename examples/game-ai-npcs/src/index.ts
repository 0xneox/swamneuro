import express, { Request, Response } from 'express';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

interface NPCRequest {
  type: 'npc';
  model: string;
  input: {
    context: string;
    personality: string;
    currentState: Record<string, unknown>;
  };
}

interface NPCResponse {
  taskId: string;
  status: string;
}

app.use(express.json());

app.post('/npc/behavior', async (req: Request, res: Response) => {
  try {
    const { gameState, npcId } = req.body;

    const npcRequest: NPCRequest = {
      type: 'npc',
      model: 'npc-behavior-v1',
      input: {
        context: gameState.context,
        personality: gameState.personality,
        currentState: gameState.currentState
      }
    };

    const response = await axios.post(`${GATEWAY_URL}/api/tasks`, {
      task: npcRequest
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    const result: NPCResponse = response.data;
    res.json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(500).json({ error: `API request failed: ${error.response?.data?.error || error.message}` });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Game AI API listening on port ${port}`);
});
