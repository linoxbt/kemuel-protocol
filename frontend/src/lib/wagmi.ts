import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { botChain } from '@/lib/chains/botChain';

// RainbowKit throws at module load (including at build time, during static
// prerendering) if projectId is empty — it can't be deferred until runtime.
// Falls back to a placeholder so `next build`/`next dev` work before a real
// WalletConnect Cloud project ID is set; only the WalletConnect QR/mobile
// flow needs a real one, injected wallets (MetaMask, etc.) work regardless.
// Get a real ID at https://cloud.walletconnect.com and set
// NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID before relying on WalletConnect.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000';

export const wagmiConfig = getDefaultConfig({
  appName: 'Kemuel Protocol',
  projectId: walletConnectProjectId,
  chains: [botChain],
  ssr: true,
});
