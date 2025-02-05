import { Neurolov } from '@neurolov/sdk';
import express from 'express';
import WebSocket from 'ws';

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

const neurolov = new Neurolov({
  apiKey: process.env.NEUROLOV_API_KEY
});

// Initialize NPC behavior model
const npcModel = await neurolov.deploy({
  name: "game-npc-ai",
  model: "./models/npc-behavior.onnx",
  scaling: {
    minNodes: 5,
    maxNodes: 20,
    autoScale: true
  }
});

// Initialize physics pipeline
const physicsPipeline = await neurolov.createPipeline({
  name: "game-physics",
  steps: [
    {
      name: "collision-detection",
      type: "custom",
      worker: "gpu",
      handler: async (ctx, data) => {
        const { objects, world } = data;
        // Run collision detection on GPU
        return await ctx.compute.runShader('collision', { objects, world });
      }
    },
    {
      name: "physics-update",
      type: "custom",
      worker: "gpu",
      handler: async (ctx, data) => {
        const { collisions, objects } = data;
        // Update physics state
        return await ctx.compute.runShader('physics', { collisions, objects });
      }
    }
  ]
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Game client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'npc_update':
          // Update NPC behavior based on game state
          const npcBehavior = await npcModel.predict({
            gameState: data.gameState,
            npcState: data.npcState,
            playerState: data.playerState
          });

          ws.send(JSON.stringify({
            type: 'npc_behavior',
            behavior: npcBehavior
          }));
          break;

        case 'physics_step':
          // Run physics simulation
          const physicsResult = await physicsPipeline.run({
            input: {
              objects: data.objects,
              world: data.world
            }
          });

          ws.send(JSON.stringify({
            type: 'physics_update',
            state: physicsResult
          }));
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });
});

// REST API for game state management
app.post('/init-game', async (req, res) => {
  try {
    const { worldSize, npcCount, terrain } = req.body;

    // Initialize game world
    const gameState = await neurolov.compute({
      type: 'custom',
      handler: async (ctx) => {
        // Generate initial game state
        const world = await ctx.compute.runShader('init-world', {
          size: worldSize,
          terrain
        });

        // Generate NPCs
        const npcs = await Promise.all(
          Array(npcCount).fill().map(async (_, i) => {
            const npc = await npcModel.predict({
              type: 'init',
              position: { x: Math.random() * worldSize.x, y: Math.random() * worldSize.y }
            });
            return { id: i, ...npc };
          })
        );

        return { world, npcs };
      }
    });

    res.json({
      success: true,
      gameState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Game AI Server running on port 3000');
  console.log('WebSocket server running on port 8080');
});
