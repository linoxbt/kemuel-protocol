import type { ReactNode } from 'react';
import { NavLabel } from '@/components/brackets/NavLabel';
import { BracketButton } from '@/components/brackets/BracketButton';

type StatProps = {
  label: string;
  value: string;
  tone?: 'safe' | 'warn' | 'critical';
};

function Stat({ label, value, tone }: StatProps) {
  const toneClass = tone === 'safe' ? 'text-safe' : tone === 'warn' ? 'text-warn' : tone === 'critical' ? 'text-critical' : 'text-paper';
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-paper-dim">{label}</p>
      <p className={`tabular-nums font-mono text-xl ${toneClass}`}>{value}</p>
    </div>
  );
}

type SummaryCardProps = {
  index: '02' | '03';
  title: string;
  headline: string;
  stats: StatProps[];
  ctaHref: string;
  ctaLabel: string;
  emptyState?: ReactNode;
};

export function SummaryCard({ index, title, headline, stats, ctaHref, ctaLabel, emptyState }: SummaryCardProps) {
  return (
    <div className="flex flex-1 flex-col border border-line bg-ink-raised p-5 sm:p-6">
      <NavLabel index={index} label={title} />
      <p className="mb-5 mt-3 font-display text-xl text-paper sm:text-2xl">{headline}</p>

      {emptyState ? (
        <div className="mb-6 flex-1">{emptyState}</div>
      ) : (
        <div className="mb-6 grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <BracketButton href={ctaHref}>{ctaLabel}</BracketButton>
    </div>
  );
}
