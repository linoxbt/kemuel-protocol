import { ethers } from 'ethers';
import { env } from './env';
import { loadDeployments } from './deployments';

// Minimal ABI fragment — just what the agent needs. Kept inline rather than
// importing contracts/artifacts/*.json so the agent doesn't break if the
// contracts workspace hasn't been compiled in a given environment.
const REGISTRY_ABI = [
  'function submitAttestation(bytes32 assetId, uint8 assetType, int256 value, uint16 confidenceBps, bytes32 dataHash, uint64 timestamp, bytes signature) external',
];

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!env.botChainRpcUrl) {
    throw new Error('BOT_CHAIN_RPC_URL is not set — see root .env.example');
  }
  if (!provider) {
    provider = new ethers.JsonRpcProvider(env.botChainRpcUrl, env.botChainChainId);
  }
  return provider;
}

export function getOracleSigner(): ethers.Wallet {
  if (!env.oracleSignerPrivateKey) {
    throw new Error('ORACLE_SIGNER_PRIVATE_KEY is not set — see root .env.example');
  }
  if (!signer) {
    signer = new ethers.Wallet(env.oracleSignerPrivateKey, getProvider());
  }
  return signer;
}

export function getRegistryContract(): ethers.Contract {
  const { contracts } = loadDeployments();
  return new ethers.Contract(contracts.AttestationRegistry, REGISTRY_ABI, getOracleSigner());
}
