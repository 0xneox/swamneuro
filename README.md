# Neurolov Network

A browser-first, decentralized AI compute platform powered by WebGPU, Solana blockchain, and swarm coordination mechanics.

## 🚀 Features

- **Browser-Native GPU Computing**: Leverage WebGPU for high-performance AI workloads
- **Decentralized Coordination**: Swarm-based task distribution and validation
- **Solana Integration**: Fast, low-cost rewards distribution and governance
- **Edge Computing**: Global network of edge nodes for optimal task routing
- **Anti-Sybil Protection**: Robust device verification and proof-of-work
- **AI Model Integration**: Support for popular models like Stable Diffusion

## 🛠 Prerequisites

- Node.js >= 16.0.0
- Rust >= 1.69.0
- Solana CLI Tools >= 1.16.0
- Chrome/Edge/Firefox with WebGPU support

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/neurolov/neurolov-network.git
cd neurolov-network
```

2. Install dependencies:
```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies
cd contracts/programs/neurolov
cargo build
```

3. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

## 🔧 Configuration

### Environment Variables

```env
# Solana Network
SOLANA_NETWORK=devnet
PROGRAM_ID=NEURoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Edge Computing
EDGE_NODES=["us-west", "us-east", "eu", "asia"]
MIN_EDGE_NODES=2

# Swarm Configuration
MIN_SWARM_SIZE=10
MAX_SWARM_SIZE=1000
LEADER_BONUS_PERCENT=20

# AI Models
STABLE_DIFFUSION_ENDPOINT=https://models.neurolov.xyz/stable-diffusion
```

## 🚀 Deployment

### 1. Deploy Smart Contracts

```bash
# Build and deploy Solana program
solana program deploy target/deploy/neurolov.so

# Initialize program state
npm run initialize-program
```

### 2. Deploy Edge Nodes

```bash
# Deploy edge nodes using Docker
docker-compose up -d edge-node

# Verify edge node health
curl https://edge-us-west.neurolov.xyz/health
```

### 3. Deploy Frontend

```bash
# Build frontend
npm run build

# Deploy to CDN (example using Cloudflare)
npm run deploy:cloudflare
```

### 4. Monitor & Scale

```bash
# Monitor swarm metrics
npm run monitor

# Scale edge nodes
docker-compose scale edge-node=5
```

## 🔐 Security

- All computation results are signed using Ed25519 signatures
- Anti-Sybil measures include device fingerprinting and PoW challenges
- Regular security audits by trusted firms
- Bug bounty program active at https://hackerone.com/neurolov

## 📈 Performance Monitoring

Access the monitoring dashboard at:
- Production: https://monitor.neurolov.xyz
- Development: http://localhost:3001/monitor

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Resources

- [Documentation](https://docs.neurolov.xyz)
- [API Reference](https://api.neurolov.xyz)
- [Discord Community](https://discord.gg/neurolov)
- [Blog](https://blog.neurolov.xyz)