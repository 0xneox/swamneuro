import { v4 as uuidv4 } from 'uuid';

const taskTypes = ['matrix_multiplication', 'neural_network', 'image_processing'];

const generateTask = () => {
  const typeIndex = Math.floor(Math.random() * taskTypes.length);
  const taskType = taskTypes[typeIndex];
  const reward = (Math.random() * 0.5 + 0.1).toFixed(4); // 0.1 to 0.6 SOL

  let data;
  switch (taskType) {
    case 'matrix_multiplication':
      const size = Math.floor(Math.random() * 500) + 500; // 500x500 to 1000x1000
      data = {
        matrixA: Array(size).fill().map(() => Array(size).fill().map(() => Math.random())),
        matrixB: Array(size).fill().map(() => Array(size).fill().map(() => Math.random()))
      };
      break;
    case 'neural_network':
      data = {
        inputs: Array(1000).fill().map(() => Math.random()),
        layers: [
          { size: 1000, activation: 'relu' },
          { size: 500, activation: 'relu' },
          { size: 100, activation: 'relu' },
          { size: 10, activation: 'softmax' }
        ]
      };
      break;
    case 'image_processing':
      const width = 1920;
      const height = 1080;
      data = {
        width,
        height,
        pixels: Array(width * height).fill().map(() => Math.floor(Math.random() * 256)),
        filter: 'gaussian_blur'
      };
      break;
  }

  return {
    id: uuidv4(),
    type: taskType,
    status: 'available',
    reward: parseFloat(reward),
    data,
    createdAt: Date.now(),
    requirements: {
      minTFLOPS: taskType === 'neural_network' ? 5 : 2,
      minMemory: taskType === 'image_processing' ? 4 : 2
    }
  };
};

export const scheduleTaskGeneration = async (redis) => {
  const generateAndStoreTask = async () => {
    const task = generateTask();
    await redis.hset(`task:${task.id}`, {
      ...task,
      data: JSON.stringify(task.data),
      requirements: JSON.stringify(task.requirements)
    });
    await redis.sadd('tasks:available', task.id);
    console.log('Generated new task:', task.id, task.type);
  };

  // Generate initial tasks
  for (let i = 0; i < 10; i++) {
    await generateAndStoreTask();
  }

  // Schedule periodic task generation
  setInterval(async () => {
    const availableTasks = await redis.scard('tasks:available');
    if (availableTasks < 5) {
      await generateAndStoreTask();
    }
  }, 10000);
};

export const assignTaskToDevice = async (redis, deviceManager, deviceId) => {
  const device = await redis.hgetall(`device:${deviceId}`);
  if (!device || device.status !== 'online' || device.currentTask) {
    return null;
  }

  const taskIds = await redis.smembers('tasks:available');
  for (const taskId of taskIds) {
    const task = await redis.hgetall(`task:${taskId}`);
    if (!task) continue;

    const requirements = JSON.parse(task.requirements);
    if (parseFloat(device.tflops) >= requirements.minTFLOPS &&
        parseFloat(device.gpuInfo.memory) >= requirements.minMemory) {
      
      // Assign task to device
      await redis.srem('tasks:available', taskId);
      await redis.hset(`task:${taskId}`, {
        status: 'assigned',
        assignedTo: deviceId,
        assignedAt: Date.now()
      });

      await deviceManager.assignTask(deviceId, task);
      return task;
    }
  }

  return null;
};

export const submitTaskResult = async (redis, taskId, result, walletAddress) => {
  const task = await redis.hgetall(`task:${taskId}`);
  if (!task) {
    throw new Error('Task not found');
  }

  if (task.status !== 'assigned') {
    throw new Error('Task not assigned or already completed');
  }

  const device = await redis.hgetall(`device:${task.assignedTo}`);
  if (!device || device.walletAddress !== walletAddress) {
    throw new Error('Unauthorized to submit result for this task');
  }

  // Validate result format based on task type
  try {
    validateTaskResult(task.type, result);
  } catch (error) {
    throw new Error(`Invalid result format: ${error.message}`);
  }

  // Update task status
  await redis.hset(`task:${taskId}`, {
    status: 'completed',
    result: JSON.stringify(result),
    completedAt: Date.now()
  });

  // Store task in device history
  await redis.lpush(`tasks:${device.id}`, JSON.stringify({
    id: taskId,
    type: task.type,
    reward: parseFloat(task.reward),
    completedAt: Date.now()
  }));

  // Update device stats
  await redis.hset(`device:${device.id}`, {
    currentTask: null,
    earnings: (parseFloat(device.earnings || 0) + parseFloat(task.reward)).toString(),
    tasksCompleted: (parseInt(device.tasksCompleted || 0) + 1).toString()
  });

  return {
    success: true,
    reward: parseFloat(task.reward)
  };
};

const validateTaskResult = (taskType, result) => {
  switch (taskType) {
    case 'matrix_multiplication':
      if (!Array.isArray(result) || !Array.isArray(result[0])) {
        throw new Error('Result must be a 2D array');
      }
      break;
    case 'neural_network':
      if (!Array.isArray(result) || result.length !== 10) {
        throw new Error('Result must be an array of 10 probabilities');
      }
      break;
    case 'image_processing':
      if (!Array.isArray(result) || !Number.isInteger(result[0])) {
        throw new Error('Result must be an array of pixel values');
      }
      break;
  }
};
