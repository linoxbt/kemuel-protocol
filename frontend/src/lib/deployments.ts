/** Deployed contract addresses, read from env rather than imported across
 * the monorepo boundary at build time. Copy these from
 * contracts/deployments/<network>.json once contracts/scripts/deploy.ts has
 * been run — see .env.example. Addresses are `undefined` until then, and
 * every hook in lib/data-source.ts treats that as "not deployed yet" rather
 * than throwing. */
export interface DeploymentAddresses {
  attestationRegistry?: `0x${string}`;
  collateralVault?: `0x${string}`;
  revenueBondVault?: `0x${string}`;
  mockUsdt?: `0x${string}`;
}

function readAddress(envVar: string | undefined): `0x${string}` | undefined {
  if (!envVar || envVar.length === 0) return undefined;
  return envVar as `0x${string}`;
}

export const deployments: DeploymentAddresses = {
  attestationRegistry: readAddress(process.env.NEXT_PUBLIC_ATTESTATION_REGISTRY_ADDRESS),
  collateralVault: readAddress(process.env.NEXT_PUBLIC_COLLATERAL_VAULT_ADDRESS),
  revenueBondVault: readAddress(process.env.NEXT_PUBLIC_REVENUE_BOND_VAULT_ADDRESS),
  mockUsdt: readAddress(process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS),
};

export const isDeployed = Boolean(
  deployments.attestationRegistry && deployments.collateralVault && deployments.revenueBondVault
);

export const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL ?? 'http://localhost:4720';
