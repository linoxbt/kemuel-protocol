'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import type { ReactNode } from 'react';
import { BracketButton } from '@/components/brackets/BracketButton';
import { BOT_CHAIN_ID, BOT_CHAIN_NAME } from '@/lib/constants';

/** Blocks /collateral and /revenue when a wallet is connected to the wrong
 * chain — not dismissable, since acting there against the wrong chain is a
 * real footgun. A wallet simply not being connected yet is a normal empty
 * state on those pages, not an error, so this only fires once connected. */
export function NetworkGuard({ children }: { children: ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const onWrongChain = isConnected && chainId !== BOT_CHAIN_ID;

  if (!onWrongChain) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-2xl text-paper">Wrong network</p>
      <p className="max-w-md font-mono text-sm text-paper-dim">
        Your wallet is connected to a different chain. Kemuel Protocol only operates on{' '}
        {BOT_CHAIN_NAME}, chain {BOT_CHAIN_ID} — switch to continue.
      </p>
      <BracketButton
        onClick={() => switchChain({ chainId: BOT_CHAIN_ID })}
        disabled={isPending}
        ariaLabel="Switch to BOT Chain"
      >
        {isPending ? 'SWITCHING…' : 'SWITCH TO BOT CHAIN'}
      </BracketButton>
    </div>
  );
}
