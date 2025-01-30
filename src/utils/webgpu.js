// WebGPU Detection and Computation Utilities
import init, { initSync } from '../wasm/neurolov_wasm';
import { StableDiffusionPipeline } from './ai/stable-diffusion';
import { createComputeShader } from './shaders/compute';

const getGPUInfo = async () => {
  // Try different canvas contexts to detect all GPUs
  const gpus = [];
  
  // Try WebGL2 with different power preferences
  const canvas = document.createElement('canvas');
  const contextTypes = ['webgl2', 'webgl'];
  const powerPreferences = ['high-performance', 'default', 'low-power'];

  for (const contextType of contextTypes) {
    for (const power of powerPreferences) {
      try {
        const gl = canvas.getContext(contextType, { powerPreference: power });
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            
            // Only add if it's a new GPU
            if (!gpus.some(gpu => gpu.renderer === renderer)) {
              gpus.push({ vendor, renderer });
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to get ${contextType} context with ${power} preference:`, e);
      }
    }
  }

  // Also try experimental-webgpu
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance'
      });
      if (adapter) {
        let adapterInfo;
        try {
          // Try the new method first
          adapterInfo = await adapter.requestAdapterInfo();
        } catch (e) {
          // Fallback to older properties if available
          adapterInfo = {
            vendor: adapter.vendor || 'Unknown',
            architecture: adapter.architecture || 'Unknown',
            description: adapter.name || 'WebGPU Device'
          };
        }
        
        if (!gpus.some(gpu => gpu.renderer === adapterInfo.description)) {
          gpus.push({
            vendor: adapterInfo.vendor,
            renderer: adapterInfo.description
          });
        }
      }
    } catch (e) {
      console.warn('WebGPU detection failed:', e);
    }
  }

  // If no GPUs found, throw error
  if (gpus.length === 0) {
    throw new Error('No GPU detected');
  }

  // Prioritize NVIDIA GPU if available
  const dedicatedGPU = gpus.find(gpu => 
    gpu.renderer.toLowerCase().includes('nvidia') || 
    gpu.renderer.toLowerCase().includes('geforce') ||
    gpu.renderer.toLowerCase().includes('rtx') ||
    gpu.renderer.toLowerCase().includes('gtx')
  );

  return {
    ...dedicatedGPU || gpus[0],
    allGpus: gpus
  };
};

export const calculateDeviceScore = async () => {
  try {
    let gpuInfo;
    let isWebGPU = false;

    try {
      gpuInfo = await getGPUInfo();
    } catch (e) {
      console.error('GPU detection failed:', e);
      throw e;
    }

    const computeScore = {
      tflops: 0,
      vram: 0,
      features: [],
      gpu: gpuInfo.renderer || 'Unknown GPU',
      vendor: gpuInfo.vendor || 'Unknown Vendor',
      architecture: 'Unknown Architecture',
      allGpus: gpuInfo.allGpus || []
    };

    // Estimate VRAM and compute power based on GPU model
    const gpuString = (computeScore.gpu + computeScore.vendor).toLowerCase();
    
    if (gpuString.includes('nvidia') || gpuString.includes('geforce')) {
      // GTX Series
      if (gpuString.includes('gtx')) {
        if (gpuString.includes('1650')) {
          computeScore.vram = 4 * 1024 * 1024 * 1024;
          computeScore.tflops = 6.5;
        } else if (gpuString.includes('1660')) {
          computeScore.vram = 6 * 1024 * 1024 * 1024;
          computeScore.tflops = 8.9;
        } else {
          computeScore.vram = 6 * 1024 * 1024 * 1024;
          computeScore.tflops = 7;
        }
      }
      // RTX Series
      else if (gpuString.includes('rtx')) {
        if (gpuString.includes('4090')) {
          computeScore.vram = 24 * 1024 * 1024 * 1024;
          computeScore.tflops = 83;
        } else if (gpuString.includes('3090')) {
          computeScore.vram = 24 * 1024 * 1024 * 1024;
          computeScore.tflops = 36;
        } else if (gpuString.includes('3080')) {
          computeScore.vram = 10 * 1024 * 1024 * 1024;
          computeScore.tflops = 30;
        } else if (gpuString.includes('3070')) {
          computeScore.vram = 8 * 1024 * 1024 * 1024;
          computeScore.tflops = 20;
        } else if (gpuString.includes('3060')) {
          computeScore.vram = 12 * 1024 * 1024 * 1024;
          computeScore.tflops = 13;
        }
      }
    } else if (gpuString.includes('intel')) {
      if (gpuString.includes('arc')) {
        computeScore.vram = 8 * 1024 * 1024 * 1024;
        computeScore.tflops = 8;
      } else if (gpuString.includes('uhd')) {
        computeScore.vram = 4 * 1024 * 1024 * 1024;
        computeScore.tflops = 4;
      } else {
        computeScore.vram = 2 * 1024 * 1024 * 1024;
        computeScore.tflops = 2;
      }
    }

    // Add capabilities
    computeScore.capabilities = {
      api: isWebGPU ? 'WebGPU' : 'WebGL',
      features: 'Basic WebGL features',
      allGpus: gpuInfo.allGpus || []
    };

    return computeScore;
  } catch (error) {
    console.error('Error calculating device score:', error);
    return {
      tflops: 0,
      vram: 0,
      features: [],
      gpu: 'Error detecting GPU',
      vendor: 'Unknown',
      architecture: 'Unknown',
      error: error.message,
      allGpus: []
    };
  }
};

export const checkWebGPUSupport = async () => {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported');
  }
  
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance'
  });
  if (!adapter) {
    throw new Error('No appropriate GPUAdapter found');
  }
  
  const device = await adapter.requestDevice();
  return { adapter, device };
};

export const initializeWasm = async () => {
  try {
    console.log('Initializing WASM module...');
    await init();
    console.log('Synchronous WASM initialization...');
    initSync();
    return true;
  } catch (error) {
    console.error('Failed to initialize WASM:', error);
    return false;
  }
};

export const initializeComputeEnvironment = async () => {
  try {
    const wasmInitialized = await initializeWasm();
    const { adapter, device } = await checkWebGPUSupport();
    const computeScore = await calculateDeviceScore();
    
    return {
      initialized: true,
      wasmInitialized,
      adapter,
      device,
      computeScore
    };
  } catch (error) {
    console.error('Failed to initialize compute environment:', error);
    throw error;
  }
};

export class AIComputeEngine {
  constructor(device) {
    this.device = device;
    this.pipeline = null;
    this.wasmInitialized = false;
  }

  async initialize() {
    try {
      this.wasmInitialized = await initializeWasm();
      this.pipeline = new StableDiffusionPipeline(this.device);
      await this.pipeline.initialize();
      return true;
    } catch (error) {
      console.error('Failed to initialize AI compute engine:', error);
      return false;
    }
  }

  async runInference(input) {
    if (!this.pipeline) {
      throw new Error('Pipeline not initialized');
    }
    return await this.pipeline.run(input);
  }

  async runMatrixMultiplication(matrixA, matrixB) {
    const shader = createMatrixMultiplyShader(this.device);
    // Implementation of matrix multiplication
    return shader.compute(matrixA, matrixB);
  }
}

export const createMatrixMultiplyShader = (device) => {
  // Implementation of matrix multiplication shader
  const shader = createComputeShader(device, `
    @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
    @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
    @group(0) @binding(2) var<storage, write> matrixC : array<f32>;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      // Matrix multiplication implementation
    }
  `);

  return {
    compute: (a, b) => {
      // Implementation of compute dispatch
    }
  };
};
