#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check required tools
echo -e "${YELLOW}Checking required tools...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Load environment variables
if [ -f .env ]; then
    echo -e "${GREEN}Loading environment variables...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}No .env file found. Please create one based on .env.example${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${YELLOW}Building the project...${NC}"
npm run build

# Start monitoring stack
echo -e "${YELLOW}Starting monitoring stack...${NC}"
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for monitoring to be ready
echo -e "${YELLOW}Waiting for monitoring to be ready...${NC}"
sleep 10

# Deploy example projects
echo -e "${YELLOW}Deploying example projects...${NC}"

# Function to deploy an example
deploy_example() {
    local example=$1
    echo -e "${YELLOW}Deploying $example...${NC}"
    
    # Build example
    docker build -t neurolov-$example ./examples/$example
    
    # Run example
    docker run -d \
        --name neurolov-$example \
        --env-file .env \
        --network neurolov \
        -p 3000 \
        neurolov-$example

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully deployed $example${NC}"
    else
        echo -e "${RED}Failed to deploy $example${NC}"
    fi
}

# Deploy each example
deploy_example "stable-diffusion-api"
deploy_example "defi-risk-analysis"
deploy_example "game-ai-npcs"
deploy_example "crypto/mev-detection"
deploy_example "crypto/token-sentiment"

# Check deployment status
echo -e "${YELLOW}Checking deployment status...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Setup monitoring
echo -e "${YELLOW}Setting up monitoring...${NC}"
curl -X POST http://localhost:3000/api/dashboards/db -H "Content-Type: application/json" -d @monitoring/grafana/dashboards/main.json

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Access the services at:"
echo -e "- Monitoring: http://localhost:3000"
echo -e "- API Documentation: http://localhost:8080/docs"
echo -e "- Example Projects: http://localhost:8081"
