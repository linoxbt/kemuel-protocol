import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

/// Deploys, in order: MockUSDT -> AttestationRegistry -> CollateralVault ->
/// RevenueBondVault. Grants ORACLE_ROLE on the registry to
/// ORACLE_SIGNER_PRIVATE_KEY's address. Mints initial demo liquidity into
/// both vaults so openLoan/issueBond have something to lend from (see the
/// vaults' own NatSpec on why they're pre-funded rather than pooling
/// deposits from elsewhere — out of scope for this build pass). Writes all
/// four addresses + the deployment block number to
/// contracts/deployments/<network>.json.
const INITIAL_VAULT_LIQUIDITY = ethers.parseUnits('1000000', 6);

async function main() {
  const oracleSignerPrivateKey = process.env.ORACLE_SIGNER_PRIVATE_KEY;
  if (!oracleSignerPrivateKey) {
    throw new Error('ORACLE_SIGNER_PRIVATE_KEY is not set — see root .env.example');
  }
  const oracleSignerAddress = new ethers.Wallet(oracleSignerPrivateKey).address;

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from ${deployer.address} on network "${network.name}"`);

  const MockUSDT = await ethers.getContractFactory('MockUSDT');
  const mockUsdt = await MockUSDT.deploy(deployer.address);
  await mockUsdt.waitForDeployment();
  console.log(`MockUSDT: ${await mockUsdt.getAddress()}`);

  const Registry = await ethers.getContractFactory('AttestationRegistry');
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  console.log(`AttestationRegistry: ${await registry.getAddress()}`);

  const CollateralVault = await ethers.getContractFactory('CollateralVault');
  const collateralVault = await CollateralVault.deploy(
    await registry.getAddress(),
    await mockUsdt.getAddress()
  );
  await collateralVault.waitForDeployment();
  console.log(`CollateralVault: ${await collateralVault.getAddress()}`);

  const RevenueBondVault = await ethers.getContractFactory('RevenueBondVault');
  const revenueBondVault = await RevenueBondVault.deploy(
    await registry.getAddress(),
    await mockUsdt.getAddress()
  );
  await revenueBondVault.waitForDeployment();
  console.log(`RevenueBondVault: ${await revenueBondVault.getAddress()}`);

  const ORACLE_ROLE = await registry.ORACLE_ROLE();
  const grantTx = await registry.grantRole(ORACLE_ROLE, oracleSignerAddress);
  await grantTx.wait();
  console.log(`Granted ORACLE_ROLE to oracle signer ${oracleSignerAddress}`);

  const mintToCollateral = await mockUsdt.mint(await collateralVault.getAddress(), INITIAL_VAULT_LIQUIDITY);
  await mintToCollateral.wait();
  const mintToRevenue = await mockUsdt.mint(await revenueBondVault.getAddress(), INITIAL_VAULT_LIQUIDITY);
  await mintToRevenue.wait();
  console.log(`Minted ${ethers.formatUnits(INITIAL_VAULT_LIQUIDITY, 6)} mUSDT into each vault`);

  const deploymentBlock = await ethers.provider.getBlockNumber();

  const output = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deploymentBlock,
    deployer: deployer.address,
    oracleSigner: oracleSignerAddress,
    contracts: {
      MockUSDT: await mockUsdt.getAddress(),
      AttestationRegistry: await registry.getAddress(),
      CollateralVault: await collateralVault.getAddress(),
      RevenueBondVault: await revenueBondVault.getAddress(),
    },
  };

  const deploymentsDir = path.resolve(__dirname, '../deployments');
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const outPath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote deployment addresses to ${outPath}`);
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exitCode = 1;
});
