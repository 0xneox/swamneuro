import { v4 as uuidv4 } from 'uuid';

export class DeviceManager {
  constructor(redis) {
    this.redis = redis;
  }

  calculateTFLOPS(gpu) {
    if (!gpu) return 1.0; // Default value for unknown GPU

    // Extract values with fallbacks
    const cores = gpu.cores || 1000;
    const clockSpeed = gpu.clockSpeed || 1.0;
    const memory = gpu.memory || 1.0;

    // Calculate TFLOPS based on available info
    // Formula: (cores * clockSpeed * 2 * memory) / 1e12
    const tflops = (cores * clockSpeed * 2 * memory) / 1e12;
    
    // Ensure reasonable bounds
    return Math.max(0.1, Math.min(tflops, 100.0));
  }

  calculateNodeType(tflops) {
    if (tflops >= 10) return 'SUPER_NODE';
    if (tflops >= 5) return 'HIGH_PERFORMANCE';
    if (tflops >= 2) return 'STANDARD';
    return 'LIGHT';
  }

  async registerDevice(deviceInfo) {
    try {
      console.log('Registering device with info:', deviceInfo);
      const deviceId = uuidv4();
      const tflops = this.calculateTFLOPS(deviceInfo.gpu);
      const nodeType = this.calculateNodeType(tflops);

      const device = {
        id: deviceId,
        walletAddress: deviceInfo.walletAddress,
        deviceType: deviceInfo.type || 'pc',
        nodeType,
        status: 'online',
        currentTask: null,
        tflops: tflops.toString(),
        gpuInfo: JSON.stringify(deviceInfo.gpu || {}),
        cpuInfo: JSON.stringify(deviceInfo.cpu || {}),
        browserInfo: JSON.stringify(deviceInfo.browser || {}),
        screenInfo: JSON.stringify(deviceInfo.screen || {}),
        lastSeen: Date.now().toString(),
        registeredAt: Date.now().toString(),
        uptime: '0',
        earnings: '0',
        tasksCompleted: '0',
        tasksAttempted: '0',
        successRate: '100'
      };

      // Store each field individually using hset
      const deviceKey = `device:${deviceId}`;
      const multi = this.redis.multi();
      
      Object.entries(device).forEach(([key, value]) => {
        multi.hset(deviceKey, key, value);
      });

      multi.sadd(`devices:${deviceInfo.walletAddress}`, deviceId);
      multi.sadd(`deviceType:${device.deviceType}`, deviceId);
      multi.sadd(`nodeType:${nodeType}`, deviceId);

      await multi.exec();
      console.log('Device registered successfully:', device);
      return device;
    } catch (error) {
      console.error('Error in registerDevice:', error);
      throw error;
    }
  }

  async updateDeviceStatus(deviceId, status = 'online') {
    try {
      const deviceKey = `device:${deviceId}`;
      const device = await this.redis.hgetall(deviceKey);
      
      if (!device || !device.id) {
        console.log('Device not found:', deviceId);
        return null;
      }

      const now = Date.now();
      const lastSeen = parseInt(device.lastSeen || now);
      const uptimeIncrease = Math.floor((now - lastSeen) / 1000);

      const updates = {
        status,
        lastSeen: now.toString(),
        uptime: (parseInt(device.uptime || 0) + uptimeIncrease).toString()
      };

      await this.redis.hset(deviceKey, updates);
      return { ...device, ...updates };
    } catch (error) {
      console.error('Error in updateDeviceStatus:', error);
      throw error;
    }
  }

  async getDeviceStats(deviceId) {
    try {
      const deviceKey = `device:${deviceId}`;
      const device = await this.redis.hgetall(deviceKey);
      
      if (!device || !device.id) {
        console.log('Device not found:', deviceId);
        return null;
      }

      return {
        id: device.id,
        type: device.deviceType,
        nodeType: device.nodeType,
        status: device.status,
        tflops: parseFloat(device.tflops || 0),
        uptime: parseInt(device.uptime || 0),
        tasksCompleted: parseInt(device.tasksCompleted || 0),
        tasksAttempted: parseInt(device.tasksAttempted || 0),
        successRate: parseFloat(device.successRate || 0),
        earnings: parseFloat(device.earnings || 0),
        gpuInfo: JSON.parse(device.gpuInfo || '{}'),
        cpuInfo: JSON.parse(device.cpuInfo || '{}'),
        browserInfo: JSON.parse(device.browserInfo || '{}'),
        screenInfo: JSON.parse(device.screenInfo || '{}')
      };
    } catch (error) {
      console.error('Error in getDeviceStats:', error);
      throw error;
    }
  }

  async getWalletStats(walletAddress) {
    try {
      console.log('Getting stats for wallet:', walletAddress);
      const deviceIds = await this.redis.smembers(`devices:${walletAddress}`);
      console.log('Found device IDs:', deviceIds);

      const devices = await Promise.all(
        deviceIds.map(id => this.getDeviceStats(id))
      );
      console.log('Retrieved devices:', devices);

      const networkStats = await this.getNetworkStats();

      const stats = {
        devices: {
          total: devices.length,
          active: devices.filter(d => d && d.status === 'online').length,
          byType: {
            pc: 0,
            mobile: 0,
            laptop: 0,
            tablet: 0,
            browser: 0
          },
          byNodeType: {
            SUPER_NODE: 0,
            HIGH_PERFORMANCE: 0,
            STANDARD: 0,
            LIGHT: 0
          }
        },
        performance: {
          totalTFLOPS: 0,
          powerShare: 0,
          averageSuccessRate: 0
        },
        tasks: {
          active: 0,
          completed: 0,
          completed24h: 0,
          successRate: 0
        },
        earnings: {
          total: 0,
          last24h: 0
        },
        network: networkStats
      };

      let totalTasksAttempted = 0;
      let totalTasksCompleted = 0;

      devices.forEach(device => {
        if (!device) return;

        // Update device counts
        stats.devices.byType[device.type] = 
          (stats.devices.byType[device.type] || 0) + 1;
        stats.devices.byNodeType[device.nodeType] = 
          (stats.devices.byNodeType[device.nodeType] || 0) + 1;

        // Update performance stats
        stats.performance.totalTFLOPS += device.tflops;

        // Update task stats
        if (device.currentTask) stats.tasks.active++;
        totalTasksAttempted += device.tasksAttempted;
        totalTasksCompleted += device.tasksCompleted;
        stats.tasks.completed += device.tasksCompleted;

        // Update earnings
        stats.earnings.total += device.earnings;
      });

      // Calculate power share
      stats.performance.powerShare = networkStats.performance.totalTFLOPS > 0 ?
        (stats.performance.totalTFLOPS / networkStats.performance.totalTFLOPS) * 100 : 0;

      // Calculate success rates
      stats.tasks.successRate = totalTasksAttempted > 0 ?
        (totalTasksCompleted / totalTasksAttempted) * 100 : 100;

      stats.performance.averageSuccessRate = devices.length > 0 ?
        devices.reduce((sum, device) => sum + (device?.successRate || 0), 0) / devices.length : 100;

      console.log('Calculated wallet stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getWalletStats:', error);
      throw error;
    }
  }

  async getNetworkStats() {
    try {
      const deviceKeys = await this.redis.keys('device:*');
      const devices = await Promise.all(
        deviceKeys.map(key => this.redis.hgetall(key))
      );

      const stats = {
        devices: {
          total: devices.length,
          active: devices.filter(d => d.status === 'online').length,
          byType: {
            pc: 0,
            mobile: 0,
            laptop: 0,
            tablet: 0,
            browser: 0
          },
          byNodeType: {
            SUPER_NODE: 0,
            HIGH_PERFORMANCE: 0,
            STANDARD: 0,
            LIGHT: 0
          }
        },
        performance: {
          totalTFLOPS: 0,
          averageTFLOPS: 0,
          networkLoad: 0
        },
        tasks: {
          active: 0,
          completed24h: 0,
          totalCompleted: 0
        }
      };

      devices.forEach(device => {
        if (!device || !device.deviceType) return;

        // Update device type counts
        stats.devices.byType[device.deviceType] = 
          (stats.devices.byType[device.deviceType] || 0) + 1;
        
        // Update node type counts
        if (device.nodeType) {
          stats.devices.byNodeType[device.nodeType] = 
            (stats.devices.byNodeType[device.nodeType] || 0) + 1;
        }

        // Update performance stats
        stats.performance.totalTFLOPS += parseFloat(device.tflops || 0);
        
        // Update task stats
        if (device.currentTask) stats.tasks.active++;
        stats.tasks.totalCompleted += parseInt(device.tasksCompleted || 0);
      });

      stats.performance.averageTFLOPS = devices.length > 0 ? 
        stats.performance.totalTFLOPS / devices.length : 0;
      
      stats.performance.networkLoad = stats.devices.active > 0 ? 
        (stats.tasks.active / stats.devices.active) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error in getNetworkStats:', error);
      throw error;
    }
  }

  async listDevices(walletAddress = null) {
    let deviceIds;
    if (walletAddress) {
      deviceIds = await this.redis.smembers(`devices:${walletAddress}`);
    } else {
      deviceIds = await this.redis.keys('device:*');
    }

    const devices = await Promise.all(
      deviceIds.map(async (id) => {
        const deviceId = id.replace('device:', '');
        return this.getDeviceStats(deviceId);
      })
    );

    return devices.filter(Boolean);
  }

  async cleanupOfflineDevices() {
    const devices = await this.listDevices();
    const now = Date.now();
    const offlineThreshold = 5 * 60 * 1000; // 5 minutes

    for (const device of devices) {
      if (now - device.lastSeen > offlineThreshold) {
        await this.updateDeviceStatus(device.id, 'offline');
      }
    }
  }

  async assignTask(deviceId, task) {
    const device = await this.redis.hgetall(`device:${deviceId}`);
    if (!device || device.status !== 'online') return null;

    await this.redis.hset(`device:${deviceId}`, {
      currentTask: task.id,
      lastTaskAssigned: Date.now().toString(),
      tasksAttempted: (parseInt(device.tasksAttempted || 0) + 1).toString()
    });

    return { ...device, currentTask: task.id };
  }

  async completeTask(deviceId, taskId, success) {
    const device = await this.redis.hgetall(`device:${deviceId}`);
    if (!device) return null;

    const tasksCompleted = success ? (parseInt(device.tasksCompleted || 0) + 1).toString() : device.tasksCompleted;
    const tasksAttempted = device.tasksAttempted;
    const successRate = tasksAttempted > 0 
      ? ((tasksCompleted / tasksAttempted) * 100).toFixed(2)
      : '100';

    const updates = {
      currentTask: null,
      tasksCompleted,
      successRate,
      lastTaskCompleted: Date.now().toString()
    };

    await this.redis.hset(`device:${deviceId}`, updates);
    return { ...device, ...updates };
  }
}
