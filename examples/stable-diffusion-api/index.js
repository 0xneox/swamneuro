import { Neurolov } from '@neurolov/sdk';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const neurolov = new Neurolov({
  apiKey: process.env.NEUROLOV_API_KEY
});

// Initialize the model
const model = await neurolov.deploy({
  name: "stable-diffusion-api",
  model: "runwayml/stable-diffusion-v1-5",
  scaling: {
    minNodes: 3,
    maxNodes: 10,
    autoScale: true
  }
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, style, size } = req.body;

    // Submit task to Neurolov network
    const task = await neurolov.submitTask({
      type: "inference",
      modelId: model.id,
      input: {
        prompt,
        style,
        size
      },
      requirements: {
        minCompute: "10TFLOPS",
        maxCost: "5NEURO"
      }
    });

    // Get results
    const result = await task.wait();

    res.json({
      success: true,
      imageUrl: result.imageUrl,
      cost: result.cost,
      computeTime: result.computeTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Stable Diffusion API running on port 3000');
});
