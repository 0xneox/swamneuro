import { atom } from 'recoil';
import { calculateDeviceScore, checkWebGPUSupport, AIComputeEngine } from '../utils/webgpu';
import { signMessage, verifySignature } from '../utils/crypto';

const EDGE_ENDPOINTS = {
  US_WEST: 'https://edge-us-west.neurolov.xyz',
  US_EAST: 'https://edge-us-east.neurolov.xyz',
  EU: 'https://edge-eu.neurolov.xyz',
  ASIA: 'https://edge-asia.neurolov.xyz'
};

const DEFAULT_SWARM_STATE = {
  id: null,
  members: [],
  totalPower: 0,
  userShare: 0,
  activeTask: null,
  leader: null,
  performance: {
    tasksCompleted: 0,
    successRate: 100,
    avgResponseTime: 0
  }
};

export const swarmState = atom({
  key: 'swarmState',
  default: DEFAULT_SWARM_STATE
});

class SwarmService {
  constructor() {
    this.ws = null;
    this.swarmId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.computeEngine = null;
    this.deviceScore = null;
    this.nearestEdge = null;
    this.leaderHeartbeat = null;
    this._state = DEFAULT_SWARM_STATE;
  }

  async initialize() {
    try {
      // Initialize WebGPU compute engine
      const { device } = await checkWebGPUSupport();
      this.computeEngine = new AIComputeEngine(device);
      await this.computeEngine.initialize();

      // Calculate device score
      this.deviceScore = await calculateDeviceScore();

      // Find nearest edge endpoint
      this.nearestEdge = await this.findNearestEdge();

      // Update initial state
      this._state = {
        ...DEFAULT_SWARM_STATE,
        totalPower: this.deviceScore?.tflops || 0,
        userShare: 100, // Initial share is 100% since user is the only member
      };
    } catch (error) {
      console.error('Failed to initialize SwarmService:', error);
      this._state = DEFAULT_SWARM_STATE;
    }
  }

  getState() {
    return this._state;
  }

  async findNearestEdge() {
    // TODO: Implement latency-based edge selection
    return EDGE_ENDPOINTS.US_WEST;
  }

  async connect(userId) {
    try {
      const url = new URL('/swarm/connect', this.nearestEdge);
      url.searchParams.set('userId', userId);
      url.searchParams.set('deviceScore', JSON.stringify(this.deviceScore));
      
      this.ws = new WebSocket(url.toString());
      
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

      return new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          this.startAntiSybilVerification();
          this.reconnectAttempts = 0;
          resolve(true);
        };

        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  }

  async startAntiSybilVerification() {
    // Proof of Work challenge
    const challenge = await this.requestChallenge();
    const proof = await this.solveChallenge(challenge);
    
    // Device verification
    const deviceProof = await this.generateDeviceProof();
    
    this.ws.send(JSON.stringify({
      type: 'VERIFY_DEVICE',
      proof,
      deviceProof
    }));
  }

  async handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'SWARM_JOINED':
          this.swarmId = data.swarmId;
          if (data.isLeader) {
            this.startLeaderDuties();
          }
          break;

        case 'LEADER_ELECTION':
          const { elected, votes } = await this.participateInElection(data);
          this.ws.send(JSON.stringify({
            type: 'ELECTION_VOTE',
            elected,
            votes,
            swarmId: this.swarmId
          }));
          break;

        case 'TASK_ASSIGNED':
          await this.processTask(data.task);
          break;

        case 'PERFORMANCE_UPDATE':
          this.updatePerformanceMetrics(data.metrics);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async processTask(task) {
    try {
      const result = await this.computeEngine.runInference(task.input);
      
      // Sign the result
      const signature = await signMessage(result);
      
      this.ws.send(JSON.stringify({
        type: 'TASK_COMPLETED',
        taskId: task.id,
        result,
        signature,
        metrics: {
          computeTime: performance.now() - task.startTime,
          deviceScore: this.deviceScore
        }
      }));
    } catch (error) {
      console.error('Task processing error:', error);
      this.ws.send(JSON.stringify({
        type: 'TASK_FAILED',
        taskId: task.id,
        error: error.message
      }));
    }
  }

  startLeaderDuties() {
    this.leaderHeartbeat = setInterval(() => {
      this.ws.send(JSON.stringify({
        type: 'LEADER_HEARTBEAT',
        swarmId: this.swarmId,
        metrics: this.collectSwarmMetrics()
      }));
    }, 5000);
  }

  stopLeaderDuties() {
    if (this.leaderHeartbeat) {
      clearInterval(this.leaderHeartbeat);
      this.leaderHeartbeat = null;
    }
  }

  collectSwarmMetrics() {
    return {
      activeMembers: this._state.members.length,
      totalPower: this._state.totalPower,
      tasksCompleted: this._state.performance.tasksCompleted,
      successRate: this._state.performance.successRate,
      avgResponseTime: this._state.performance.avgResponseTime
    };
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.stopLeaderDuties();
  }

  async handleClose() {
    this.stopLeaderDuties();
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }
}

export const swarmService = new SwarmService();

// Initialize the service
swarmService.initialize().catch(console.error);
