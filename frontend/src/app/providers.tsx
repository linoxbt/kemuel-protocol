'use client';

import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { wagmiConfig } from '@/lib/wagmi';

const rainbowKitTheme = darkTheme({
  accentColor: '#BE6A2A',
  accentColorForeground: '#F4EEDF',
  borderRadius: 'small',
  fontStack: 'system',
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  // RainbowKitProvider's internal wallet-list construction crashes on any
  // server-side render (a documented issue with wagmi v2 connectors not
  // having a `uid` assigned until client-side init) — not just static
  // prerendering, `force-dynamic` alone doesn't fix it. Deferring the whole
  // RainbowKit tree until after client mount keeps its internals from ever
  // running on the server, at the cost of a brief blank shell on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted ? <RainbowKitProvider theme={rainbowKitTheme}>{children}</RainbowKitProvider> : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
