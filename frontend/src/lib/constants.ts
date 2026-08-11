export const MIN_CONFIDENCE_BPS = 7000;

// BOT Chain testnet is the currently deployed/active network for this build
// (contracts get deployed there first, per the base spec's phased
// testnet-before-mainnet approach). Both sets of values below are confirmed
// live via direct eth_chainId RPC calls. Flip ACTIVE_NETWORK to 'mainnet'
// once Phase 7 (mainnet deployment) happens.
export const ACTIVE_NETWORK: 'testnet' | 'mainnet' =
  (process.env.NEXT_PUBLIC_BOT_CHAIN_CHAIN_ID ?? '968') === '677' ? 'mainnet' : 'testnet';

export const BOT_CHAIN_ID = ACTIVE_NETWORK === 'mainnet' ? 677 : 968;
export const BOT_CHAIN_NAME = ACTIVE_NETWORK === 'mainnet' ? 'BOT Chain' : 'BOT Chain Testnet';
export const EXPLORER_BASE_URL =
  ACTIVE_NETWORK === 'mainnet' ? 'https://scan.botchain.ai' : 'https://scan.bohr.life';
