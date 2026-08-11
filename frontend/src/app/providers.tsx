'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { wagmiConfig } from '@/lib/wagmi';

// Importing lib/wagmi.ts runs createAppKit() as a module side effect,
// registering the connect-modal web component globally — no wrapping
// provider component needed the way RainbowKitProvider required (Reown
// AppKit is built with first-class Next.js App Router SSR support via the
// adapter's `ssr: true` option, unlike RainbowKit's SSR crash we hit
// before — if this turns out not to hold, reintroduce the client-mount
// gate that was here previously).
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
