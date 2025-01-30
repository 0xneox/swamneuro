const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:13000';
const SWARM_URL = process.env.SWARM_URL || 'http://localhost:13001';
const COMPUTE_URL = process.env.COMPUTE_URL || 'http://localhost:13002';
const TASK_URL = process.env.TASK_URL || 'http://localhost:13003';

// Utility for handling API errors
const handleApiError = (error, endpoint) => {
  console.error(`API Error (${endpoint}):`, error);
  if (error.response) {
    throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
  }
  throw new Error('Network error occurred');
};

export const registerDevice = async (deviceInfo) => {
  try {
    const response = await fetch(`${SWARM_URL}/api/swarm/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deviceInfo)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
};

export const updateDeviceStatus = async (deviceId) => {
  try {
    const response = await fetch(`${SWARM_URL}/api/swarm/status/${deviceId}/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
};

export const getWalletStats = async (walletAddress) => {
  try {
    // Fetch data from all services
    const [swarmResponse, computeResponse, taskResponse] = await Promise.all([
      fetch(`${SWARM_URL}/api/swarm/status`),
      fetch(`${COMPUTE_URL}/api/compute/stats`),
      fetch(`${TASK_URL}/api/tasks/stats`)
    ]);

    if (!swarmResponse.ok || !computeResponse.ok || !taskResponse.ok) {
      throw new Error('One or more services returned an error');
    }

    const [swarmStatus, computeStats, taskStats] = await Promise.all([
      swarmResponse.json(),
      computeResponse.json(),
      taskResponse.json()
    ]);

    console.log('Swarm Status:', swarmStatus);
    console.log('Compute Stats:', computeStats);
    console.log('Task Stats:', taskStats);

    // Calculate total earnings (mock data for now)
    const earnings = {
      total: 10.50,
      last24h: 2.25
    };

    // Calculate tasks stats
    const tasks = {
      completed: taskStats.completed || 0,
      active: taskStats.active || 0,
      successRate: taskStats.successRate || 100
    };

    // Calculate device stats
    const devices = {
      active: swarmStatus.activeMembers || 0,
      total: swarmStatus.totalMembers || 0
    };

    // Calculate performance stats
    const performance = {
      totalTFLOPS: computeStats.totalTflops || 0,
      powerShare: calculatePowerShare(swarmStatus.members || [], walletAddress)
    };

    return {
      earnings,
      tasks,
      devices,
      performance
    };
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    // Return mock data in case of error during development
    return {
      earnings: {
        total: 10.50,
        last24h: 2.25
      },
      tasks: {
        completed: 5,
        active: 2,
        successRate: 100
      },
      devices: {
        active: 2,
        total: 2
      },
      performance: {
        totalTFLOPS: 9.0,
        powerShare: 50.0
      }
    };
  }
};

export const getNetworkStats = async () => {
  try {
    const [swarmResponse, computeResponse, taskResponse] = await Promise.all([
      fetch(`${SWARM_URL}/api/swarm/status`),
      fetch(`${COMPUTE_URL}/api/compute/stats`),
      fetch(`${TASK_URL}/api/tasks/stats`)
    ]);

    if (!swarmResponse.ok || !computeResponse.ok || !taskResponse.ok) {
      throw new Error('One or more services returned an error');
    }

    const [swarmStatus, computeStats, taskStats] = await Promise.all([
      swarmResponse.json(),
      computeResponse.json(),
      taskResponse.json()
    ]);

    return {
      totalNodes: swarmStatus.totalMembers || 0,
      activeNodes: swarmStatus.activeMembers || 0,
      totalTasks: taskStats.totalTasks || 0,
      activeTasks: taskStats.active || 0,
      performance: {
        totalTFLOPS: computeStats.totalTflops || 0,
        averageUtilization: computeStats.averageUtilization || 0
      }
    };
  } catch (error) {
    console.error('Error fetching network stats:', error);
    // Return mock data in case of error during development
    return {
      totalNodes: 2,
      activeNodes: 2,
      totalTasks: 7,
      activeTasks: 2,
      performance: {
        totalTFLOPS: 9.0,
        averageUtilization: 67.5
      }
    };
  }
};

// Utility functions
function calculateSuccessRate(tasks) {
  if (!tasks || tasks.length === 0) return 100;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return (completed / tasks.length) * 100;
}

function calculateTotalTFLOPS(members) {
  if (!members || members.length === 0) return 0;
  return members.reduce((total, member) => total + (member.performance?.tflops || 0), 0);
}

function calculatePowerShare(members, walletAddress) {
  if (!members || members.length === 0) return 0;
  
  const totalPower = calculateTotalTFLOPS(members);
  if (!totalPower) return 0;
  
  const userPower = members
    .filter(m => m.walletAddress === walletAddress)
    .reduce((total, member) => total + (member.performance?.tflops || 0), 0);
    
  return (userPower / totalPower) * 100;
}
