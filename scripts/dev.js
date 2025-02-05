import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Use node executable path
const nodePath = process.execPath;

const services = {
  gateway: {
    command: nodePath,
    args: ['src/services/api.js'],
    cwd: path.join(__dirname, '..'),
    port: process.env.GATEWAY_PORT || 13000
  },
  swarm: {
    command: nodePath,
    args: ['src/services/server/swarmServer.js'],
    cwd: path.join(__dirname, '..'),
    port: process.env.SWARM_PORT || 13001
  },
  compute: {
    command: nodePath,
    args: ['src/services/server/computeServer.js'],
    cwd: path.join(__dirname, '..'),
    port: process.env.COMPUTE_PORT || 13002
  },
  task: {
    command: nodePath,
    args: ['src/services/server/taskServer.js'],
    cwd: path.join(__dirname, '..'),
    port: process.env.TASK_PORT || 13003
  }
};

function startService(name, config) {
  console.log(`Starting ${name} service on port ${config.port}...`);
  
  const service = spawn(config.command, config.args, {
    stdio: 'pipe',
    cwd: config.cwd,
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

  service.on('error', (err) => {
    console.error(`[${name}] Failed to start service:`, err);
  });

  return service;
}

// Start all services
Object.entries(services).forEach(([name, config]) => {
  startService(name, config);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down all services...');
  process.exit();
});
