const getGPUInfo = async () => {
  try {
    // First try WebGPU
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          const info = await adapter.requestAdapterInfo();
          return {
            name: info.name || info.description || 'WebGPU Device',
            vendor: info.vendor || 'Unknown',
            memory: info.maxMemory ? Math.floor(info.maxMemory / (1024 * 1024 * 1024)) : 4, // Convert to GB
            isWebGPU: true,
            adapter: info
          };
        }
      } catch (error) {
        console.warn('WebGPU detection failed:', error);
      }
    }

    // Fallback to WebGL
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null;
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null;

    const gpuName = renderer || 'Unknown GPU';
    const isIntegrated = gpuName.toLowerCase().includes('intel');
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    
    return {
      name: gpuName,
      vendor: vendor || 'Unknown',
      memory: isIntegrated ? 2 : 4,
      cores: maxFragmentUniformVectors * 32,
      clockSpeed: isIntegrated ? 1.2 : 1.8,
      isWebGPU: false,
      webgl: {
        version: gl.getParameter(gl.VERSION),
        maxTextureSize,
        maxFragmentUniformVectors
      }
    };
  } catch (error) {
    console.error('Error detecting GPU:', error);
    return {
      name: 'Unknown GPU',
      vendor: 'Unknown',
      memory: 1,
      cores: 1000,
      clockSpeed: 1.0,
      isWebGPU: false
    };
  }
};

const getCPUInfo = () => {
  const cores = navigator.hardwareConcurrency || 4;
  
  // Estimate device tier based on cores
  let tier = 'low';
  if (cores >= 8) tier = 'high';
  else if (cores >= 4) tier = 'medium';
  
  return {
    cores,
    tier,
    type: 'Unknown',
    clockSpeed: 2.0
  };
};

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browserRegexes = [
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', regex: /Edg\/([0-9.]+)/ }
  ];

  let browserName = 'Unknown';
  let browserVersion = '0';

  for (const browser of browserRegexes) {
    const match = ua.match(browser.regex);
    if (match) {
      browserName = browser.name;
      browserVersion = match[1];
      break;
    }
  }

  return {
    name: browserName,
    version: browserVersion,
    language: navigator.language,
    platform: navigator.platform,
    cores: navigator.hardwareConcurrency || 4,
    hasWebGPU: !!navigator.gpu,
    hasWebGL2: !!document.createElement('canvas').getContext('webgl2'),
    hasWebWorkers: !!window.Worker,
    hasSharedArrayBuffer: !!window.SharedArrayBuffer,
    serviceWorkerSupport: 'serviceWorker' in navigator
  };
};

const getScreenInfo = () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,
    orientation: window.screen.orientation?.type || 'unknown'
  };
};

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getDeviceCapabilities = async () => {
  const [gpu, screen] = await Promise.all([
    getGPUInfo(),
    Promise.resolve(getScreenInfo())
  ]);

  const cpu = getCPUInfo();
  const browser = getBrowserInfo();
  const deviceType = getDeviceType();

  // Calculate overall performance score
  const calculatePerformanceScore = () => {
    let score = 0;
    
    // CPU score (0-100)
    score += (cpu.cores / 16) * 50; // Max 16 cores
    
    // GPU score (0-100)
    if (gpu.isWebGPU) score += 100;
    else if (gpu.webgl) score += 50;
    
    // Memory score (0-50)
    const memory = navigator?.deviceMemory || 4;
    score += (memory / 16) * 50; // Max 16GB
    
    return Math.min(100, score);
  };

  return {
    deviceType,
    performance: {
      score: calculatePerformanceScore(),
      tier: cpu.tier
    },
    gpu,
    cpu,
    screen,
    browser,
    memory: {
      total: navigator?.deviceMemory || 4,
      unit: 'GB'
    },
    capabilities: {
      webgpu: gpu.isWebGPU,
      webgl2: browser.hasWebGL2,
      webWorkers: browser.hasWebWorkers,
      serviceWorker: browser.serviceWorkerSupport,
      sharedArrayBuffer: browser.hasSharedArrayBuffer
    }
  };
};

export {
  getGPUInfo,
  getCPUInfo,
  getBrowserInfo,
  getScreenInfo,
  getDeviceType,
  getDeviceCapabilities
};
