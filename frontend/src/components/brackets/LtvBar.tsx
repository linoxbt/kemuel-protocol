'use client';

import { formatBps } from '@/lib/format';

type LtvBarProps = {
  ltvBps: number;
  liquidationThresholdBps: number;
  /** True while the parent card's stamp-flash is playing — delays this
   * bar's own transition by ~180ms so the two never run at once, per the
   * motion spec's sequencing rule. */
  delayTransition?: boolean;
};

function tierFor(ltvBps: number, liquidationThresholdBps: number): 'safe' | 'warn' | 'critical' {
  if (ltvBps >= liquidationThresholdBps) return 'critical';
  if (ltvBps >= liquidationThresholdBps * 0.85) return 'warn';
  return 'safe';
}

const TIER_CLASSES = {
  safe: 'bg-safe',
  warn: 'bg-warn',
  critical: 'bg-critical',
};

/** Full-width LTV bar — track in `line`, fill color-coded by health tier,
 * numeric % right-aligned in tabular-nums. Width/color transition over
 * 400ms, sequenced after any stamp-flash on the same card (handled by the
 * caller via a short delay, not by this component). */
export function LtvBar({ ltvBps, liquidationThresholdBps, delayTransition }: LtvBarProps) {
  const tier = tierFor(ltvBps, liquidationThresholdBps);
  const widthPct = Math.min(100, (ltvBps / liquidationThresholdBps) * 100);

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-paper-dim">
        <span>LTV</span>
        <span className="tabular-nums text-paper">{formatBps(ltvBps)}</span>
      </div>
      <div className="h-2 w-full bg-line/40">
        <div
          className={`h-full transition-[width,background-color] duration-[400ms] ease-out ${
            delayTransition ? 'delay-[180ms]' : ''
          } ${TIER_CLASSES[tier]}`}
          style={{ width: `${widthPct}%` }}
          role="progressbar"
          aria-valuenow={ltvBps / 100}
          aria-valuemin={0}
          aria-valuemax={liquidationThresholdBps / 100}
          aria-label={`Loan to value ${formatBps(ltvBps)}, liquidates at ${formatBps(liquidationThresholdBps)}`}
        />
      </div>
    </div>
  );
}
