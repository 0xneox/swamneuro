import { Neurolov } from '@neurolov/sdk';
import { ethers } from 'ethers';
import express from 'express';

const app = express();
app.use(express.json());

const neurolov = new Neurolov({
  apiKey: process.env.NEUROLOV_API_KEY
});

// Initialize risk model
const riskModel = await neurolov.deploy({
  name: "defi-risk-analyzer",
  model: "./models/risk-lstm.onnx",
  scaling: {
    minNodes: 2,
    maxNodes: 5
  }
});

// Initialize market data pipeline
const pipeline = await neurolov.createPipeline({
  steps: [
    {
      name: "fetch-data",
      type: "custom",
      worker: "cpu",
      handler: async (ctx) => {
        const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC);
        const block = await provider.getBlockNumber();
        const transactions = await Promise.all(
          Array(10).fill().map((_, i) => 
            provider.getBlockWithTransactions(block - i)
          )
        );
        return { transactions, block };
      }
    },
    {
      name: "process-data",
      type: "custom",
      worker: "cpu",
      handler: async (ctx, data) => {
        const { transactions } = data;
        // Process transaction data
        const metrics = transactions.flatMap(block => 
          block.transactions.map(tx => ({
            value: tx.value.toString(),
            gasPrice: tx.gasPrice.toString(),
            timestamp: block.timestamp
          }))
        );
        return { metrics };
      }
    },
    {
      name: "analyze-risk",
      type: "inference",
      worker: "gpu",
      modelId: riskModel.id,
      handler: async (ctx, data) => {
        const { metrics } = data;
        return await ctx.model.predict(metrics);
      }
    }
  ]
});

app.post('/analyze', async (req, res) => {
  try {
    const { address } = req.body;

    // Run analysis pipeline
    const result = await pipeline.run({
      input: { address },
      config: {
        timeout: 30000,
        priority: "high"
      }
    });

    res.json({
      success: true,
      riskScore: result.riskScore,
      metrics: result.metrics,
      recommendations: result.recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('DeFi Risk Analysis API running on port 3000');
});
