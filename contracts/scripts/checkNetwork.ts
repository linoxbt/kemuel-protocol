import { ethers } from 'hardhat';

async function main() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const network = await ethers.provider.getNetwork();
  console.log(`Connected to chain ${network.chainId}. Current block: ${blockNumber}`);
}

main().catch((error) => {
  console.error('checkNetwork failed — RPC URL is likely wrong or unreachable:', error);
  process.exitCode = 1;
});
