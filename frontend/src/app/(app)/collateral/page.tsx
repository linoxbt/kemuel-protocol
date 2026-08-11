'use client';

import { NavLabel } from '@/components/brackets/NavLabel';
import { EventFeed } from '@/components/brackets/EventFeed';
import { LoanList } from '@/components/collateral/LoanList';
import { SimulateAttestationButton } from '@/components/collateral/SimulateAttestationButton';
import { useLoans, useCollateralEvents } from '@/lib/data-source';
import { isDeployed } from '@/lib/deployments';

export default function CollateralPage() {
  const { data: loans, isLoading } = useLoans();
  const events = useCollateralEvents();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <NavLabel index="02" label="COLLATERAL VAULT" />
      <h1 className="mb-10 mt-3 font-display text-3xl text-paper">Open loans</h1>

      {!isDeployed ? (
        <p className="mb-10 border border-line bg-ink-raised p-4 font-mono text-xs text-warn">
          Contracts are not deployed yet on this network — see NEXT_PUBLIC_* addresses in
          .env.example. This page will populate once deployment completes.
        </p>
      ) : null}

      {isLoading ? (
        <p className="mb-10 font-mono text-sm text-paper-dim">Loading loans…</p>
      ) : loans.length === 0 ? (
        <div className="mb-10 flex flex-col items-center gap-6 border border-line bg-ink-raised py-16 text-center">
          <p className="font-display text-xl text-paper">No attested collateral yet.</p>
          <SimulateAttestationButton />
        </div>
      ) : (
        <>
          <LoanList loans={loans} />
          <div className="mt-8">
            <SimulateAttestationButton />
          </div>
        </>
      )}

      <div className="mt-16 border-t border-line pt-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-wide text-paper-dim">
          [ Live event feed ]
        </p>
        <EventFeed events={events} emptyLabel="No on-chain events yet." />
      </div>
    </div>
  );
}
