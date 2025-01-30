# Testnet Deployment Guide

## Prerequisites

1. Ensure you have testnet ETH in your deployer wallet
   - Get Sepolia ETH from: https://sepoliafaucet.com/
   - Get Goerli ETH from: https://goerlifaucet.com/

2. Environment Setup
   - Copy `.env.example` to `.env.testnet`
   - Update the following variables:
     ```
     TESTNET_PRIVATE_KEY=your_private_key
     TESTNET_RPC_URL=your_rpc_url
     ETHERSCAN_API_KEY=your_etherscan_key
     ```

## Deployment Steps

1. **Compile Contracts**
   ```bash
   npx hardhat compile
   ```

2. **Run Tests**
   ```bash
   npx hardhat test
   ```

3. **Deploy to Testnet**
   ```bash
   npx hardhat run scripts/deploy-testnet.js --network testnet
   ```

4. **Verify Deployment**
   - Check deployment addresses in `deployments/testnet.json`
   - Verify contracts on Etherscan
   - Test basic functionality using Hardhat console

## Post-Deployment Steps

1. **Update Frontend Configuration**
   - Update contract addresses in frontend config
   - Update API endpoints to point to testnet
   - Update environment variables

2. **Testing Checklist**
   - [ ] Device registration
   - [ ] Task creation and distribution
   - [ ] Reward distribution
   - [ ] Network statistics
   - [ ] Error handling
   - [ ] Gas optimization

3. **Monitoring Setup**
   - Set up testnet monitoring in Grafana
   - Configure alerts for critical events
   - Monitor gas usage and optimization

4. **Documentation**
   - Update API documentation with testnet endpoints
   - Document known testnet limitations
   - Update integration guides

## Common Issues & Solutions

1. **Transaction Failures**
   - Check gas price and limits
   - Verify contract initialization
   - Check testnet ETH balance

2. **Contract Verification**
   - Ensure correct compiler version
   - Match constructor arguments
   - Check flattened contract source

3. **Network Issues**
   - Use reliable RPC endpoints
   - Implement proper retry logic
   - Monitor network status

## Security Considerations

1. **Smart Contract Security**
   - Limited admin functionality
   - Emergency pause mechanism
   - Rate limiting
   - Access control

2. **Frontend Security**
   - API key management
   - Error handling
   - Input validation
   - Rate limiting

3. **Infrastructure Security**
   - Secure RPC endpoints
   - API gateway protection
   - DDoS mitigation
   - Monitoring alerts

## Support & Resources

- Technical Support: [Discord/Telegram link]
- Bug Reports: [GitHub Issues]
- Documentation: [Docs URL]
- Network Status: [Status Page]
