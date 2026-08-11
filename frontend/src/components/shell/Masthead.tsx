'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { LogoLockup } from '@/components/brackets/LogoLockup';
import { BracketButton } from '@/components/brackets/BracketButton';
import { MobileNav } from '@/components/shell/MobileNav';
import { truncateAddress } from '@/lib/format';

export function Masthead() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  // Mirrors the mount-guard RainbowKit's ConnectButton.Custom did
  // internally — avoids a server/client markup mismatch on first paint,
  // since wallet connection state is only ever known client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
        <LogoLockup size="sm" />
        <nav className="flex items-center gap-4 sm:gap-6">
          <a
            href="/dashboard"
            className="hidden font-mono text-xs uppercase tracking-wide text-paper-dim transition-colors hover:text-paper sm:inline"
          >
            Dashboard
          </a>
          <a
            href="/collateral"
            className="hidden font-mono text-xs uppercase tracking-wide text-paper-dim transition-colors hover:text-paper sm:inline"
          >
            Collateral
          </a>
          <a
            href="/revenue"
            className="hidden font-mono text-xs uppercase tracking-wide text-paper-dim transition-colors hover:text-paper sm:inline"
          >
            Revenue
          </a>
          {!mounted ? (
            <span className="h-5 w-16 opacity-0 sm:w-24" aria-hidden />
          ) : isConnected && address ? (
            <BracketButton onClick={() => open({ view: 'Account' })} ariaLabel="Account">
              {truncateAddress(address)}
            </BracketButton>
          ) : (
            <BracketButton onClick={() => open()} ariaLabel="Connect wallet">
              <span className="hidden sm:inline">CONNECT WALLET</span>
              <span className="sm:hidden">CONNECT</span>
            </BracketButton>
          )}
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
