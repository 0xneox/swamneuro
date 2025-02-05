module.exports = {
  // Infrastructure
  infrastructure: {
    loadBalancer: {
      provider: 'cloudflare',
      regions: ['us-east', 'eu-west', 'ap-south'],
      failover: true
    },
    database: {
      primary: {
        type: 'postgresql',
        replicas: 3,
        backupSchedule: '0 */4 * * *' // Every 4 hours
      },
      cache: {
        type: 'redis',
        clusters: 3,
        maxMemory: '2gb'
      }
    },
    monitoring: {
      prometheus: {
        retentionDays: 30,
        alerting: true
      },
      grafana: {
        publicDashboards: true,
        alerting: true
      }
    }
  },

  // Security
  security: {
    rateLimit: {
      requests: 100,
      period: '1m'
    },
    ddos: {
      provider: 'cloudflare',
      sensitivity: 'high'
    },
    api: {
      keyRotationDays: 90,
      maxKeys: 5
    }
  },

  // Network
  network: {
    swarm: {
      minNodes: 3,
      maxNodes: 1000,
      healthCheckInterval: 30000,
      taskTimeout: 300000
    },
    fallback: {
      enabled: true,
      modes: ['webgl', 'cpu'],
      autoSwitch: true
    }
  },

  // Task Processing
  tasks: {
    validation: {
      minValidators: 3,
      consensusThreshold: 0.66,
      timeout: 60000
    },
    rewards: {
      baseRate: 10,
      bonusMultiplier: 1.5,
      slashingPenalty: 0.5
    }
  },

  // Developer Platform
  developer: {
    rateLimit: {
      requests: 1000,
      period: '1h'
    },
    sandbox: {
      enabled: true,
      resources: {
        cpu: '1',
        memory: '2Gi',
        storage: '10Gi'
      }
    }
  },

  // AI Services
  ai: {
    providers: {
      openai: {
        models: ['gpt-4', 'gpt-3.5-turbo'],
        fallback: 'gpt-3.5-turbo'
      },
      gemini: {
        models: ['gemini-pro'],
        fallback: null
      },
      deepseek: {
        models: ['deepseek-coder'],
        fallback: null
      }
    },
    taskGeneration: {
      interval: 300000, // 5 minutes
      batchSize: 100
    }
  },

  // Legal & Compliance
  legal: {
    termsVersion: '1.0.0',
    privacyVersion: '1.0.0',
    requiredDocuments: ['terms', 'privacy'],
    kycRequired: false
  }
};
