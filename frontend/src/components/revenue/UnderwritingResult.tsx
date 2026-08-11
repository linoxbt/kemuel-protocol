import { formatUsd, formatBps } from '@/lib/format';
import type { UnderwritingResult as UnderwritingResultType } from '@/lib/types';

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'critical' }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-paper-dim">{label}</p>
      <p
        className={`tabular-nums font-mono text-lg ${tone === 'critical' ? 'text-critical' : 'text-paper'}`}
      >
        {value}
      </p>
    </div>
  );
}

export function UnderwritingResult({ result }: { result: UnderwritingResultType }) {
  return (
    <div className="border border-line bg-ink-raised p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
        <Stat label="Period revenue" value={formatUsd(result.periodRevenueUsd)} />
        <Stat label="Volatility" value={result.volatilityScore.toFixed(2)} />
        <Stat label="Risk score" value={result.riskScore.toFixed(2)} />
        <Stat
          label="Confidence"
          value={formatBps(result.confidenceBps)}
          tone={result.declined ? 'critical' : undefined}
        />
      </div>
      {result.declined ? (
        <p className="mt-5 font-mono text-xs text-critical">{result.declineReason}</p>
      ) : (
        <p className="mt-5 font-mono text-xs text-paper-dim">
          Recommended revenue share: {formatBps(result.recommendedRevenueShareBps)}
        </p>
      )}
    </div>
  );
}
