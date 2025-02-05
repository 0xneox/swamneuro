const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const services = {
  coordinator: {
    command: 'node',
    args: ['src/coordinator/index.js'],
    port: process.env.COORDINATOR_PORT || 9000
  },
  validator: {
    command: 'node',
    args: ['src/validator/index.js'],
    port: process.env.VALIDATOR_PORT || 9001
  },
  storage: {
    command: 'node',
    args: ['src/storage/index.js'],
    port: process.env.STORAGE_PORT || 9002
  }
};

function startService(name, config) {
  console.log(`Starting ${name} service on port ${config.port}...`);
  
  const service = spawn(config.command, config.args, {
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: config.port
    }
  });

  service.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  service.stderr.on('data', (data) => {
    console.error(`[${name}] Error: ${data.toString().trim()}`);
  });

  service.on('close', (code) => {
    console.log(`[${name}] Service exited with code ${code}`);
  });

  return service;
}

// Start all services
Object.entries(services).forEach(([name, config]) => {
  startService(name, config);
});
