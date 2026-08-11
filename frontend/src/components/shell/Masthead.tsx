'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { LogoLockup } from '@/components/brackets/LogoLockup';
import { BracketButton } from '@/components/brackets/BracketButton';
import { MobileNav } from '@/components/shell/MobileNav';
import { truncateAddress } from '@/lib/format';

export function Masthead() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <LogoLockup size="sm" withSubline />
        <nav className="flex items-center gap-6">
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
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              if (!ready) {
                return <span className="h-5 w-24 opacity-0" aria-hidden />;
              }

              if (!connected) {
                return (
                  <BracketButton onClick={openConnectModal} ariaLabel="Connect wallet">
                    CONNECT WALLET
                  </BracketButton>
                );
              }

              return (
                <BracketButton onClick={openAccountModal} ariaLabel="Account">
                  {truncateAddress(account.address)}
                </BracketButton>
              );
            }}
          </ConnectButton.Custom>
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
