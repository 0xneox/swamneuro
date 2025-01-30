# Neurolov Network Quick Start Guide

## What is Neurolov?

Neurolov is a decentralized compute network that allows you to run AI/ML workloads across a network of GPU/CPU nodes. Think of it as a decentralized AWS Lambda for AI computation.

## 🚀 5-Minute Quick Start

### 1. Installation

```bash
npm install @neurolov/sdk
```

### 2. Initialize SDK

```javascript
import { Neurolov } from '@neurolov/sdk';

const neurolov = new Neurolov({
  apiKey: 'your-api-key'  // Get from dashboard.neurolov.xyz
});
```

### 3. Run Your First Task

```javascript
// Run a simple inference task
const result = await neurolov.compute({
  type: 'inference',
  model: 'stable-diffusion-v1-5',
  input: {
    prompt: 'A beautiful sunset'
  }
});

console.log(result.imageUrl);
```

## 🎯 Core Features

### 1. Direct Computation

Run immediate compute tasks:

```javascript
// Run computation
const result = await neurolov.compute({
  type: 'custom',
  worker: 'gpu',
  handler: async (ctx) => {
    // Your computation code here
    return await ctx.runShader('your-shader', data);
  }
});
```

### 2. Model Deployment

Deploy your own AI models:

```javascript
// Deploy model
const model = await neurolov.deploy({
  name: 'my-model',
  model: './model.onnx',
  scaling: {
    minNodes: 3,
    maxNodes: 10
  }
});

// Use deployed model
const result = await model.predict({
  input: 'your input data'
});
```

### 3. Processing Pipelines

Create multi-step processing pipelines:

```javascript
const pipeline = await neurolov.createPipeline({
  steps: [
    {
      name: 'preprocess',
      type: 'custom',
      worker: 'cpu',
      handler: async (ctx, data) => {
        // Preprocessing logic
      }
    },
    {
      name: 'inference',
      type: 'inference',
      worker: 'gpu',
      model: 'your-model-id'
    },
    {
      name: 'postprocess',
      type: 'custom',
      worker: 'cpu',
      handler: async (ctx, data) => {
        // Postprocessing logic
      }
    }
  ]
});

// Run pipeline
const result = await pipeline.run({
  input: yourData
});
```

## 💡 Example Projects

1. [Stable Diffusion API](../examples/stable-diffusion-api)
   - Image generation API
   - Auto-scaling compute
   - Cost optimization

2. [DeFi Risk Analysis](../examples/defi-risk-analysis)
   - Real-time market analysis
   - Risk scoring
   - Transaction monitoring

3. [Game AI & NPCs](../examples/game-ai-npcs)
   - Real-time NPC behavior
   - Physics calculations
   - World generation

## 🔧 Configuration Options

### Compute Options

```javascript
{
  type: 'inference' | 'training' | 'custom',
  worker: 'gpu' | 'cpu',
  priority: 'low' | 'medium' | 'high',
  timeout: 30000, // ms
  maxCost: '10NEURO'
}
```

### Scaling Options

```javascript
{
  minNodes: 3,
  maxNodes: 10,
  autoScale: true,
  scaleUpThreshold: 0.8, // 80% utilization
  scaleDownThreshold: 0.2
}
```

## 📊 Monitoring

Access your dashboard at [dashboard.neurolov.xyz](https://dashboard.neurolov.xyz) to:
- Monitor compute usage
- Track costs
- View task status
- Check node health

## 🆘 Support

- Documentation: [docs.neurolov.xyz](https://docs.neurolov.xyz)
- Discord: [discord.gg/neurolov](https://discord.gg/neurolov)
- Email: support@neurolov.xyz
- GitHub: [github.com/neurolov](https://github.com/neurolov)

## 🔜 Next Steps

1. Explore [full documentation](https://docs.neurolov.xyz)
2. Join our [Discord community](https://discord.gg/neurolov)
3. Try our [example projects](../examples)
4. Deploy your first model
