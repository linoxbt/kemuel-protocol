import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-gas-reporter';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Root .env, shared across contracts/agent/frontend workspaces.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Confirmed live via direct eth_chainId RPC calls (returned 0x2a5 / 0x3c8 as
// expected) — these are the same values DevStation's dev-shipyard build
// verified independently. Overridable via env for a custom RPC (e.g. a
// private/rate-limit-friendly endpoint) without touching this file.
const BOT_CHAIN_MAINNET_RPC_URL = process.env.BOT_CHAIN_MAINNET_RPC_URL || 'https://rpc.botchain.ai';
const BOT_CHAIN_MAINNET_CHAIN_ID = 677;
const BOT_CHAIN_TESTNET_RPC_URL = process.env.BOT_CHAIN_TESTNET_RPC_URL || 'https://rpc.bohr.life';
const BOT_CHAIN_TESTNET_CHAIN_ID = 968;

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';
const deployerAccounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // BOT Chain's actual opcode support beyond what a live eth_chainId
      // call can tell us is still unverified. Pinning to a pre-Cancun
      // target avoids relying on mcopy/transient-storage opcodes that a
      // BSC-derived chain may not have. Revisit once confirmed.
      evmVersion: 'paris',
    },
  },
  networks: {
    botchain: {
      url: BOT_CHAIN_MAINNET_RPC_URL,
      chainId: BOT_CHAIN_MAINNET_CHAIN_ID,
      accounts: deployerAccounts,
    },
    'botchain-testnet': {
      url: BOT_CHAIN_TESTNET_RPC_URL,
      chainId: BOT_CHAIN_TESTNET_CHAIN_ID,
      accounts: deployerAccounts,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
};

export default config;
