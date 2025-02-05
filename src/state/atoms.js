import { atom } from 'recoil';

// Mock wallet for development
const mockWallet = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  connected: true,
  publicKey: '0x1234567890abcdef1234567890abcdef12345678'
};

export const walletState = atom({
  key: 'walletState',
  default: mockWallet // Use mock wallet as default state
});

// Mock device for development
const mockDevice = {
  id: 'device1',
  type: 'gpu',
  status: 'active',
  performance: {
    tflops: 5.2,
    gpuMemory: 8192,
    utilizationPercent: 75
  }
};

export const deviceState = atom({
  key: 'deviceState',
  default: mockDevice // Use mock device as default state
});

// Mock tasks for development
const mockTasks = {
  active: [
    {
      id: 'task1',
      type: 'inference',
      status: 'processing',
      progress: 75
    },
    {
      id: 'task2',
      type: 'training',
      status: 'processing',
      progress: 30
    }
  ],
  completed: [
    {
      id: 'task3',
      type: 'inference',
      status: 'completed',
      result: { accuracy: 0.95 }
    }
  ],
  available: [
    {
      id: 'task4',
      type: 'training',
      status: 'available',
      reward: 1.5
    }
  ]
};

export const taskState = atom({
  key: 'taskState',
  default: mockTasks // Use mock tasks as default state
});
