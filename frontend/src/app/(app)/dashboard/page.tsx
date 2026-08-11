'use client';

import { useMemo } from 'react';
import { EventFeed } from '@/components/brackets/EventFeed';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useLoans, useBonds, useCollateralEvents, useRevenueEvents } from '@/lib/data-source';
import { isDeployed } from '@/lib/deployments';
import { formatUsd } from '@/lib/format';

export default function DashboardPage() {
  const { data: loans, isLoading: loansLoading } = useLoans();
  const { data: bonds, isLoading: bondsLoading } = useBonds();
  const collateralEvents = useCollateralEvents();
  const revenueEvents = useRevenueEvents();

  const mergedEvents = useMemo(
    () => [...collateralEvents, ...revenueEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20),
    [collateralEvents, revenueEvents]
  );

  const loanStats = useMemo(() => {
    const healthy = loans.filter((l) => l.status === 'healthy').length;
    const marginCall = loans.filter((l) => l.status === 'margin_call').length;
    const liquidated = loans.filter((l) => l.status === 'liquidated').length;
    const principal = loans.reduce((sum, l) => sum + l.principalUsdt, 0);
    return { healthy, marginCall, liquidated, principal };
  }, [loans]);

  const bondStats = useMemo(() => {
    const active = bonds.filter((b) => b.status === 'active').length;
    const repaid = bonds.filter((b) => b.status === 'repaid').length;
    const outstanding = bonds.reduce((sum, b) => sum + b.outstandingBalanceUsdt, 0);
    return { active, repaid, outstanding };
  }, [bonds]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-seal">[ Dashboard ]</p>
      <h1 className="mb-8 font-display text-2xl text-paper sm:mb-10 sm:text-3xl">
        Registry overview
      </h1>

      {!isDeployed ? (
        <p className="mb-8 border border-line bg-ink-raised p-4 font-mono text-xs text-warn">
          Contracts are not deployed yet on this network — see NEXT_PUBLIC_* addresses in
          .env.example. This page will populate once deployment completes.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <SummaryCard
          index="02"
          title="COLLATERAL VAULT"
          headline={loansLoading ? 'Loading…' : `${loans.length} open loan${loans.length === 1 ? '' : 's'}`}
          stats={[
            { label: 'Healthy', value: String(loanStats.healthy), tone: 'safe' },
            { label: 'Margin call', value: String(loanStats.marginCall), tone: 'warn' },
            { label: 'Liquidated', value: String(loanStats.liquidated), tone: 'critical' },
            { label: 'Total principal', value: formatUsd(loanStats.principal) },
          ]}
          ctaHref="/collateral"
          ctaLabel="OPEN COLLATERAL VAULT"
          emptyState={
            !loansLoading && loans.length === 0 ? (
              <p className="font-mono text-xs text-paper-dim">No attested collateral yet.</p>
            ) : undefined
          }
        />
        <SummaryCard
          index="03"
          title="REVENUE BOND VAULT"
          headline={bondsLoading ? 'Loading…' : `${bonds.length} bond${bonds.length === 1 ? '' : 's'}`}
          stats={[
            { label: 'Active', value: String(bondStats.active), tone: 'safe' },
            { label: 'Repaid', value: String(bondStats.repaid) },
            { label: 'Outstanding', value: formatUsd(bondStats.outstanding), tone: 'warn' },
          ]}
          ctaHref="/revenue"
          ctaLabel="OPEN REVENUE BONDS"
          emptyState={
            !bondsLoading && bonds.length === 0 ? (
              <p className="font-mono text-xs text-paper-dim">No revenue bonds yet.</p>
            ) : undefined
          }
        />
      </div>

      <div className="mt-12 border-t border-line pt-8 sm:mt-16 sm:pt-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-wide text-paper-dim">
          [ Live event feed — all activity ]
        </p>
        <EventFeed events={mergedEvents} emptyLabel="No on-chain events yet." />
      </div>
    </div>
  );
}
