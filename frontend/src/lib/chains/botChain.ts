import { defineChain } from 'viem';
import { ACTIVE_NETWORK, BOT_CHAIN_ID, BOT_CHAIN_NAME, EXPLORER_BASE_URL } from '@/lib/constants';

// Confirmed live via direct eth_chainId RPC calls — see constants.ts.
const DEFAULT_RPC_URL = ACTIVE_NETWORK === 'mainnet' ? 'https://rpc.botchain.ai' : 'https://rpc.bohr.life';
const rpcUrl = process.env.NEXT_PUBLIC_BOT_CHAIN_RPC_URL || DEFAULT_RPC_URL;

export const botChain = defineChain({
  id: BOT_CHAIN_ID,
  name: BOT_CHAIN_NAME,
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'BOT Chain Explorer', url: EXPLORER_BASE_URL },
  },
  testnet: ACTIVE_NETWORK === 'testnet',
});
