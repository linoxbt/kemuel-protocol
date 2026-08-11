type PillStatus = 'healthy' | 'margin_call' | 'liquidated' | 'active' | 'repaid' | 'pending' | 'declined';

const STATUS_META: Record<PillStatus, { label: string; className: string }> = {
  healthy: { label: 'HEALTHY', className: 'text-safe' },
  active: { label: 'ACTIVE', className: 'text-safe' },
  margin_call: { label: 'MARGIN CALL', className: 'text-warn' },
  pending: { label: 'PENDING', className: 'text-warn' },
  liquidated: { label: 'LIQUIDATED', className: 'text-critical' },
  declined: { label: 'DECLINED', className: 'text-critical' },
  repaid: { label: 'REPAID', className: 'text-paper-dim' },
};

type StatusPillProps = {
  status: PillStatus;
};

/**
 * Bracketed mono tag with a semantic dot — status is carried by color AND
 * text label together, never color alone.
 */
export function StatusPill({ status }: StatusPillProps) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-current px-2 py-0.5 font-mono text-[11px] tracking-wide ${meta.className}`}
    >
      [ <span aria-hidden>●</span> {meta.label} ]
    </span>
  );
}
