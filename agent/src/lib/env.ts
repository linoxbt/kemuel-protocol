import * as dotenv from 'dotenv';
import * as path from 'path';

// Root .env, shared across contracts/agent/frontend workspaces.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

// Confirmed live via direct eth_chainId RPC calls — same values
// contracts/hardhat.config.ts uses. NETWORK defaults to testnet since
// that's the network being deployed to first.
const network = optional('NETWORK') ?? 'botchain-testnet';
const isMainnet = network === 'botchain';

export const env = {
  botChainRpcUrl:
    optional('BOT_CHAIN_RPC_URL') ??
    (isMainnet
      ? optional('BOT_CHAIN_MAINNET_RPC_URL') ?? 'https://rpc.botchain.ai'
      : optional('BOT_CHAIN_TESTNET_RPC_URL') ?? 'https://rpc.bohr.life'),
  botChainChainId: Number(optional('BOT_CHAIN_CHAIN_ID') ?? (isMainnet ? '677' : '968')),
  oracleSignerPrivateKey: optional('ORACLE_SIGNER_PRIVATE_KEY'),
  anthropicApiKey: optional('ANTHROPIC_API_KEY'),
  stripeTestSecretKey: optional('STRIPE_TEST_SECRET_KEY'),
  network,
  port: Number(optional('AGENT_PORT') ?? '4720'),
};

export type Env = typeof env;
