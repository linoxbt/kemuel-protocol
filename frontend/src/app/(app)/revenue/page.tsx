'use client';

import { useState } from 'react';
import { NavLabel } from '@/components/brackets/NavLabel';
import { EventFeed } from '@/components/brackets/EventFeed';
import { StripeConnectForm } from '@/components/revenue/StripeConnectForm';
import { UnderwritingResult } from '@/components/revenue/UnderwritingResult';
import { SimulateRevenuePeriodButton } from '@/components/revenue/SimulateRevenuePeriodButton';
import { useRevenueEvents } from '@/lib/data-source';
import { isDeployed } from '@/lib/deployments';
import type { UnderwritingResult as UnderwritingResultType } from '@/lib/types';

export default function RevenuePage() {
  const [result, setResult] = useState<UnderwritingResultType | null>(null);
  const events = useRevenueEvents();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <NavLabel index="03" label="REVENUE BOND VAULT" />
      <h1 className="mb-8 mt-3 font-display text-2xl text-paper sm:mb-10 sm:text-3xl">
        Revenue-share financing
      </h1>

      {!isDeployed ? (
        <p className="mb-10 border border-line bg-ink-raised p-4 font-mono text-xs text-warn">
          Contracts are not deployed yet on this network — see NEXT_PUBLIC_* addresses in
          .env.example. This page will populate once deployment completes.
        </p>
      ) : null}

      <div className="mb-10">
        {result ? <UnderwritingResult result={result} /> : <StripeConnectForm onConnected={setResult} />}
      </div>

      {result ? (
        <div className="mb-10">
          <SimulateRevenuePeriodButton />
        </div>
      ) : null}

      <div className="mt-12 border-t border-line pt-8 sm:mt-16 sm:pt-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-wide text-paper-dim">
          [ Live event feed ]
        </p>
        <EventFeed events={events} emptyLabel="No on-chain events yet." />
      </div>
    </div>
  );
}
