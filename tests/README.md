# Neurolov Network Testing Suite

## Overview

This testing suite provides comprehensive testing for the Neurolov Network, including:
- Integration Tests
- Load Tests
- Stress Tests
- Security Tests
- Performance Tests

## Test Categories

### 1. Integration Tests
- Node Network Tests
- Task Processing Tests
- Coordination Tests
- Error Handling Tests

### 2. Load Tests (k6)
- API Endpoint Tests
- Task Processing Tests
- Node Registration Tests
- Network Scaling Tests

### 3. Stress Tests
- Multi-worker Tests
- Network Capacity Tests
- Resource Utilization Tests
- Error Rate Analysis

### 4. Security Tests
- DDoS Protection Tests
- Authentication Tests
- Authorization Tests
- Data Security Tests
- Smart Contract Security Tests

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Set up test environment
cp .env.example .env.test
```

### Running Individual Test Suites

```bash
# Integration Tests
npm run test:integration

# Load Tests
npm run test:load

# Stress Tests
npm run test:stress

# Security Tests
npm run test:security
```

### Running All Tests

```bash
# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage
```

## Test Configuration

### Environment Variables
```env
TEST_NETWORK_ID=test-network
TEST_API_KEY=test-key
TEST_NODE_COUNT=10
TEST_TASK_COUNT=1000
```

### Test Parameters
```typescript
// Load Test Parameters
const LOAD_TEST_DURATION = '15m';
const LOAD_TEST_USERS = 100;

// Stress Test Parameters
const STRESS_TEST_DURATION = '5m';
const STRESS_TEST_WORKERS = 8;

// Security Test Parameters
const SECURITY_TEST_ATTEMPTS = 1000;
```

## Test Reports

Reports are generated in the `reports` directory:
- `reports/integration/`
- `reports/load/`
- `reports/stress/`
- `reports/security/`

## Coverage Reports

Coverage reports are generated in the `coverage` directory:
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage.json`
- LCOV report: `coverage/lcov.info`

## Continuous Integration

Tests are automatically run in CI/CD pipeline:
1. On every pull request
2. On merge to main branch
3. Nightly stress tests
4. Weekly security scans

## Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts`
3. Add test to appropriate npm script
4. Update documentation

## Best Practices

1. Keep tests isolated
2. Clean up resources
3. Use meaningful assertions
4. Handle async operations
5. Mock external services
6. Use test fixtures

## Troubleshooting

### Common Issues

1. Test Timeouts
```bash
# Increase timeout in package.json
"scripts": {
  "test": "mocha --timeout 30000"
}
```

2. Memory Issues
```bash
# Run with increased memory
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

3. Network Issues
```bash
# Use test network configuration
TEST_NETWORK_CONFIG=local npm test
```

## Support

For testing issues:
- Create GitHub issue
- Contact: testing@neurolov.xyz
- Join Discord: #testing-support
