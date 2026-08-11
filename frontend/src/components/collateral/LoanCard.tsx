'use client';

import { useEffect, useRef, useState } from 'react';
import { StatusPill } from '@/components/brackets/StatusPill';
import { LtvBar } from '@/components/brackets/LtvBar';
import { truncateAddress, formatUsd } from '@/lib/format';
import type { Loan } from '@/lib/types';

export function LoanCard({ loan }: { loan: Loan }) {
  const previousLtvBps = useRef<number | undefined>(undefined);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    // Only flash on a real change after the first attested value — never on
    // initial mount, per the stamp-flash spec ("fires once, never loops").
    const changed = previousLtvBps.current !== undefined && previousLtvBps.current !== loan.ltvBps;
    previousLtvBps.current = loan.ltvBps;

    if (changed) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 180);
      return () => clearTimeout(timeout);
    }
  }, [loan.ltvBps]);

  return (
    <div className={`border border-line bg-ink-raised p-5 ${flash ? 'animate-stamp-flash' : ''}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-paper-dim">ASSET</p>
          <p className="font-mono text-sm text-paper">{truncateAddress(loan.assetId)}</p>
        </div>
        <StatusPill status={loan.status} />
      </div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="font-mono text-[11px] text-paper-dim">PRINCIPAL</span>
        <span className="tabular-nums font-mono text-sm text-paper">
          {formatUsd(loan.principalUsdt)}
        </span>
      </div>
      <LtvBar
        ltvBps={loan.ltvBps}
        liquidationThresholdBps={loan.liquidationThresholdBps}
        delayTransition={flash}
      />
    </div>
  );
}
