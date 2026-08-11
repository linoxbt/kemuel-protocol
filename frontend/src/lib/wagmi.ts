import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createAppKit } from '@reown/appkit/react';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { botChain } from '@/lib/chains/botChain';

// Reown AppKit throws at module load if projectId is empty — same failure
// mode RainbowKit had, same fix. Falls back to a placeholder so
// `next build`/`next dev` work before a real project ID is set; only the
// WalletConnect QR/mobile-linking flow needs a real one, injected wallets
// (MetaMask, etc.) work regardless. Get a real ID (free) at
// https://cloud.reown.com and set NEXT_PUBLIC_REOWN_PROJECT_ID.
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '00000000000000000000000000000000';

// BOT Chain isn't one of AppKit's built-in networks (@reown/appkit/networks
// only ships well-known chains) — cast our own viem chain definition, the
// documented approach for custom EVM chains.
const botChainNetwork = botChain as unknown as AppKitNetwork;

const wagmiAdapter = new WagmiAdapter({
  networks: [botChainNetwork],
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [botChainNetwork],
  projectId,
  metadata: {
    name: 'Kemuel Protocol',
    description: 'A continuous-truth oracle for real-world assets on BOT Chain.',
    url: 'https://github.com/linoxbt/kemuel-protocol',
    icons: [
      'https://raw.githubusercontent.com/linoxbt/kemuel-protocol/main/frontend/public/brand/logo-bracket.svg',
    ],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#BE6A2A',
  },
  features: {
    analytics: false,
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
