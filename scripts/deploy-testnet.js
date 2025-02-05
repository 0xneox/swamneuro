require('dotenv').config({ path: '.env.testnet' });
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting testnet deployment...');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy core contract
  const SwamNeuro = await ethers.getContractFactory('SwamNeuro');
  const swamNeuro = await SwamNeuro.deploy();
  await swamNeuro.deployed();
  console.log(`SwamNeuro deployed to: ${swamNeuro.address}`);

  // Deploy task manager
  const TaskManager = await ethers.getContractFactory('TaskManager');
  const taskManager = await TaskManager.deploy(swamNeuro.address);
  await taskManager.deployed();
  console.log(`TaskManager deployed to: ${taskManager.address}`);

  // Deploy reward distributor
  const RewardDistributor = await ethers.getContractFactory('RewardDistributor');
  const rewardDistributor = await RewardDistributor.deploy(swamNeuro.address);
  await rewardDistributor.deployed();
  console.log(`RewardDistributor deployed to: ${rewardDistributor.address}`);

  // Initialize contracts
  await swamNeuro.setTaskManager(taskManager.address);
  await swamNeuro.setRewardDistributor(rewardDistributor.address);
  console.log('Contracts initialized');

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    swamNeuro: swamNeuro.address,
    taskManager: taskManager.address,
    rewardDistributor: rewardDistributor.address,
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('Deployment complete! Addresses saved to deployments/');

  // Verify contracts on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log('Verifying contracts on Etherscan...');
    await hre.run('verify:verify', {
      address: swamNeuro.address,
      constructorArguments: []
    });
    await hre.run('verify:verify', {
      address: taskManager.address,
      constructorArguments: [swamNeuro.address]
    });
    await hre.run('verify:verify', {
      address: rewardDistributor.address,
      constructorArguments: [swamNeuro.address]
    });
    console.log('Contract verification complete!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
