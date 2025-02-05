import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || process.env.SWARM_PORT || 13001;

// Middleware
app.use(cors());
app.use(express.json());

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Track connected swarm members
const swarmMembers = new Map();

// Mock data for development
const mockPerformanceData = {
  tflops: 2.5,
  tasksCompleted: 0,
  successRate: 100,
  avgResponseTime: 50
};

wss.on('connection', (ws, req) => {
  const memberId = Math.random().toString(36).substring(7);
  const walletAddress = req.headers['x-wallet-address'] || '0x0000000000000000000000000000000000000000';
  
  // Add new member
  swarmMembers.set(memberId, {
    ws,
    walletAddress,
    joinedAt: Date.now(),
    lastHeartbeat: Date.now(),
    performance: { ...mockPerformanceData }
  });

  // Send current swarm state
  ws.send(JSON.stringify({
    type: 'swarm_state',
    data: {
      id: memberId,
      members: Array.from(swarmMembers.keys()),
      totalMembers: swarmMembers.size
    }
  }));

  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'heartbeat':
          handleHeartbeat(memberId, data);
          break;
        case 'performance_update':
          handlePerformanceUpdate(memberId, data);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    swarmMembers.delete(memberId);
    broadcastSwarmUpdate();
  });

  // Broadcast update to all members
  broadcastSwarmUpdate();
});

// Broadcast swarm updates to all members
function broadcastSwarmUpdate() {
  const update = {
    type: 'swarm_update',
    data: {
      totalMembers: swarmMembers.size,
      members: Array.from(swarmMembers.entries()).map(([id, data]) => ({
        id,
        walletAddress: data.walletAddress,
        performance: data.performance
      }))
    }
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
}

// Handle heartbeat messages
function handleHeartbeat(memberId, data) {
  const member = swarmMembers.get(memberId);
  if (member) {
    member.lastHeartbeat = Date.now();
    member.performance = { ...member.performance, ...data.performance };
  }
}

// Handle performance updates
function handlePerformanceUpdate(memberId, data) {
  const member = swarmMembers.get(memberId);
  if (member) {
    member.performance = { ...member.performance, ...data.performance };
    broadcastSwarmUpdate();
  }
}

// REST endpoints
app.get('/api/swarm/status', (req, res) => {
  // Clean up inactive members (no heartbeat for > 1 minute)
  const now = Date.now();
  for (const [id, member] of swarmMembers.entries()) {
    if (now - member.lastHeartbeat > 60000) {
      swarmMembers.delete(id);
    }
  }

  const members = Array.from(swarmMembers.entries()).map(([id, data]) => ({
    id,
    walletAddress: data.walletAddress,
    joinedAt: data.joinedAt,
    lastHeartbeat: data.lastHeartbeat,
    performance: data.performance
  }));

  res.json({
    totalMembers: swarmMembers.size,
    activeMembers: members.length,
    members,
    totalPerformance: members.reduce((total, m) => total + (m.performance?.tflops || 0), 0)
  });
});

app.post('/api/swarm/register', (req, res) => {
  const { walletAddress, deviceInfo } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const memberId = Math.random().toString(36).substring(7);
  
  // Store member info (without WebSocket connection)
  swarmMembers.set(memberId, {
    walletAddress,
    deviceInfo,
    joinedAt: Date.now(),
    lastHeartbeat: Date.now(),
    performance: { ...mockPerformanceData }
  });

  res.json({
    memberId,
    status: 'registered',
    swarmSize: swarmMembers.size
  });
});

app.post('/api/swarm/status/:memberId/heartbeat', (req, res) => {
  const { memberId } = req.params;
  const member = swarmMembers.get(memberId);
  
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  member.lastHeartbeat = Date.now();
  if (req.body.performance) {
    member.performance = { ...member.performance, ...req.body.performance };
  }

  res.json({
    status: 'ok',
    lastHeartbeat: member.lastHeartbeat
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', members: swarmMembers.size });
});

// Create HTTP server
const server = app.listen(port, () => {
  console.log(`Swarm service running on port ${port}`);
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
