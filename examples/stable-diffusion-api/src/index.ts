import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Submit task to Neurolov Network
    const response = await fetch('http://gateway:8080/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.TESTNET_API_KEY
      },
      body: JSON.stringify({
        task: {
          type: 'stable-diffusion',
          prompt,
          model: 'sd-v1.5'
        }
      })
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Stable Diffusion API listening on port ${port}`);
});
