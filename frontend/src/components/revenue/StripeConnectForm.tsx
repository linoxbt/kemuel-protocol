'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { BracketButton } from '@/components/brackets/BracketButton';
import { useStripeTestConnect } from '@/lib/data-source';
import type { UnderwritingResult } from '@/lib/types';

export function StripeConnectForm({
  onConnected,
}: {
  onConnected: (result: UnderwritingResult) => void;
}) {
  const [key, setKey] = useState('');
  const { connect, result, status, error } = useStripeTestConnect();

  useEffect(() => {
    if (status === 'connected' && result) {
      onConnected(result);
    }
    // onConnected is expected to be a stable setter from the parent, and
    // including it would re-run this on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, result]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await connect(key);
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-ink-raised p-6">
      <label htmlFor="stripe-key" className="font-mono text-xs uppercase tracking-wide text-paper-dim">
        [ Connect Stripe — Test Mode ]
      </label>
      <input
        id="stripe-key"
        type="password"
        autoComplete="off"
        value={key}
        onChange={(event) => setKey(event.target.value)}
        placeholder="sk_test_…"
        className="mt-3 w-full border border-line bg-ink px-3 py-2 font-mono text-sm text-paper outline-none focus-visible:border-seal"
      />
      <p className="mt-2 font-mono text-[11px] text-warn">TEST MODE ONLY — no real charges</p>

      <div className="mt-4 flex items-center gap-4">
        <BracketButton type="submit" disabled={status === 'connecting' || key.length === 0}>
          {status === 'connecting' ? 'CONNECTING…' : 'CONNECT'}
        </BracketButton>
        {status === 'error' && error ? (
          <p className="font-mono text-xs text-critical">{error}</p>
        ) : null}
      </div>
    </form>
  );
}
