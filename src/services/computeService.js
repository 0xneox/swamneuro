import { PublicKey } from '@solana/web3.js';

class ComputeService {
  constructor() {
    this.device = null;
    this.queue = null;
    this.initialized = false;
  }

  async initialize() {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in your browser');
    }

    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });

      if (!adapter) {
        throw new Error('No GPU adapter found');
      }

      this.device = await adapter.requestDevice();
      this.queue = this.device.queue;
      this.initialized = true;

      console.log('GPU Device initialized:', {
        name: adapter.name,
        maxBufferSize: this.device.limits.maxBufferSize,
        maxComputeWorkgroupsPerDimension: this.device.limits.maxComputeWorkgroupsPerDimension
      });
    } catch (error) {
      console.error('Failed to initialize GPU device:', error);
      throw error;
    }
  }

  async executeTask(task) {
    if (!this.initialized) {
      await this.initialize();
    }

    switch (task.type) {
      case 'matrix_multiplication':
        return await this.executeMatrixMultiplication(task);
      case 'neural_network':
        return await this.executeNeuralNetwork(task);
      case 'image_processing':
        return await this.executeImageProcessing(task);
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }

  async executeMatrixMultiplication(task) {
    const { matrixA, matrixB } = task.data;
    // Matrix multiplication shader
    const shader = `
      @group(0) @binding(0) var<storage, read> a: array<f32>;
      @group(0) @binding(1) var<storage, read> b: array<f32>;
      @group(0) @binding(2) var<storage, read_write> result: array<f32>;

      @compute @workgroup_size(8, 8)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let row = global_id.x;
        let col = global_id.y;
        let n = ${matrixA[0].length};

        var sum = 0.0;
        for (var i = 0u; i < n; i = i + 1u) {
          sum = sum + a[row * n + i] * b[i * n + col];
        }
        result[row * n + col] = sum;
      }
    `;

    // Create buffers and bind group
    const resultBuffer = await this.executeShader(shader, [
      this.createBuffer(new Float32Array(matrixA.flat())),
      this.createBuffer(new Float32Array(matrixB.flat())),
      this.createBuffer(new Float32Array(matrixA.length * matrixB[0].length))
    ]);

    return {
      result: Array.from(new Float32Array(await resultBuffer.arrayBuffer())),
      dimensions: [matrixA.length, matrixB[0].length]
    };
  }

  async executeNeuralNetwork(task) {
    const { weights, inputs } = task.data;
    // Neural network inference shader
    const shader = `
      @group(0) @binding(0) var<storage, read> weights: array<f32>;
      @group(0) @binding(1) var<storage, read> inputs: array<f32>;
      @group(0) @binding(2) var<storage, read_write> outputs: array<f32>;

      fn relu(x: f32) -> f32 {
        return max(0.0, x);
      }

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let neuron_id = global_id.x;
        let input_size = ${inputs.length};
        
        var sum = 0.0;
        for (var i = 0u; i < input_size; i = i + 1u) {
          sum = sum + weights[neuron_id * input_size + i] * inputs[i];
        }
        outputs[neuron_id] = relu(sum);
      }
    `;

    // Create buffers and bind group
    const resultBuffer = await this.executeShader(shader, [
      this.createBuffer(new Float32Array(weights.flat())),
      this.createBuffer(new Float32Array(inputs)),
      this.createBuffer(new Float32Array(weights.length / inputs.length))
    ]);

    return {
      result: Array.from(new Float32Array(await resultBuffer.arrayBuffer()))
    };
  }

  createBuffer(data, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST) {
    const buffer = this.device.createBuffer({
      size: data.byteLength,
      usage,
      mappedAtCreation: true
    });

    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
  }

  async executeShader(shaderCode, buffers) {
    const shaderModule = this.device.createShaderModule({
      code: shaderCode
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: buffers.map((_, i) => ({
        binding: i,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'storage' }
      }))
    });

    const bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: buffers.map((buffer, i) => ({
        binding: i,
        resource: { buffer }
      }))
    });

    const pipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
      }),
      compute: {
        module: shaderModule,
        entryPoint: 'main'
      }
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(
      Math.ceil(buffers[buffers.length - 1].size / 256),
      1,
      1
    );
    passEncoder.end();

    // Read back the result
    const resultBuffer = this.device.createBuffer({
      size: buffers[buffers.length - 1].size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    commandEncoder.copyBufferToBuffer(
      buffers[buffers.length - 1],
      0,
      resultBuffer,
      0,
      resultBuffer.size
    );

    this.queue.submit([commandEncoder.finish()]);
    await resultBuffer.mapAsync(GPUMapMode.READ);
    return resultBuffer;
  }

  async submitResult(taskId, result, walletAddress) {
    try {
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          result,
          walletAddress: walletAddress.toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to submit task result:', error);
      throw error;
    }
  }
}

const computeService = new ComputeService();
export default computeService;
