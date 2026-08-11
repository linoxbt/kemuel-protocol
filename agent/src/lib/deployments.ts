import * as fs from 'fs';
import * as path from 'path';
import { env } from './env';

export interface DeploymentAddresses {
  network: string;
  chainId: number;
  deploymentBlock: number;
  deployer: string;
  oracleSigner: string;
  contracts: {
    MockUSDT: string;
    AttestationRegistry: string;
    CollateralVault: string;
    RevenueBondVault: string;
  };
}

let cached: DeploymentAddresses | null = null;

/** Reads contracts/deployments/<network>.json, written by
 * contracts/scripts/deploy.ts. Throws with a clear message if deployment
 * hasn't happened yet for the configured network — callers should surface
 * this as a 503 from /health rather than a raw stack trace. */
export function loadDeployments(): DeploymentAddresses {
  if (cached) return cached;

  const deploymentsPath = path.resolve(__dirname, `../../../contracts/deployments/${env.network}.json`);
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error(
      `No deployment found at ${deploymentsPath}. Run contracts/scripts/deploy.ts against "${env.network}" first.`
    );
  }

  cached = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8')) as DeploymentAddresses;
  return cached;
}
