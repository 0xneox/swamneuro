#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting Neurolov Network Testnet Deployment${NC}"

# 1. Environment Setup
echo -e "${YELLOW}Setting up environment...${NC}"
if [ ! -f .env.testnet ]; then
    echo -e "${RED}Error: .env.testnet file not found${NC}"
    exit 1
fi
export $(cat .env.testnet | grep -v '^#' | xargs)

# 2. Check Dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }

# 3. Build and Deploy Monitoring
echo -e "${YELLOW}Deploying monitoring stack...${NC}"
docker-compose -f docker-compose.monitoring.yml up -d

# 4. Deploy Smart Contracts
echo -e "${YELLOW}Deploying smart contracts...${NC}"
npx hardhat run scripts/deploy-contracts.ts --network testnet

# 5. Initialize Coordinator Nodes
echo -e "${YELLOW}Initializing coordinator nodes...${NC}"
docker-compose -f docker-compose.coordinator.yml up -d

# 6. Initialize Validator Nodes
echo -e "${YELLOW}Initializing validator nodes...${NC}"
docker-compose -f docker-compose.validator.yml up -d

# 7. Initialize Storage Nodes
echo -e "${YELLOW}Initializing storage nodes...${NC}"
docker-compose -f docker-compose.storage.yml up -d

# 8. Deploy Edge Node Software
echo -e "${YELLOW}Deploying edge node software...${NC}"
npm run deploy:edge-nodes

# 9. Initialize API Gateway
echo -e "${YELLOW}Initializing API gateway...${NC}"
docker-compose -f docker-compose.gateway.yml up -d

# 10. Deploy Example Projects
echo -e "${YELLOW}Deploying example projects...${NC}"
for example in examples/*/; do
    if [ -f "$example/docker-compose.yml" ]; then
        echo -e "${YELLOW}Deploying ${example}...${NC}"
        (cd "$example" && docker-compose up -d)
    fi
done

# 11. Run Health Checks
echo -e "${YELLOW}Running health checks...${NC}"
./scripts/health-check.sh

# 12. Initialize Test Data
echo -e "${YELLOW}Initializing test data...${NC}"
npm run init:testdata

# Check deployment status
echo -e "${YELLOW}Checking deployment status...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Print Network Information
echo -e "${GREEN}Testnet Deployment Complete!${NC}"
echo -e "Access points:"
echo -e "- Dashboard: http://localhost:3000"
echo -e "- API Gateway: http://localhost:8080"
echo -e "- Documentation: http://localhost:8081"
echo -e "- Monitoring: http://localhost:9090"

# Print Test Credentials
echo -e "\n${YELLOW}Test Credentials:${NC}"
echo -e "API Key: $TESTNET_API_KEY"
echo -e "RPC Endpoint: $TESTNET_RPC_URL"
echo -e "Explorer: $TESTNET_EXPLORER_URL"

# Print Next Steps
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Run test suite: npm run test:testnet"
echo -e "2. Monitor metrics: http://localhost:3000/metrics"
echo -e "3. Check logs: docker-compose logs -f"
echo -e "4. Try example projects: http://localhost:8081/examples"
