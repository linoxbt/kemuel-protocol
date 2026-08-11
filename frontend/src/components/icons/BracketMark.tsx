type BracketMarkProps = {
  className?: string;
  size?: number;
};

/** Primary mark — registration-mark corners framing a bronze K. Used for the
 * masthead logo lockup and favicon/app icon. */
export function BracketMark({ className, size = 24 }: BracketMarkProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Kemuel Protocol"
    >
      <g stroke="currentColor" strokeWidth={10} strokeLinecap="square">
        <path d="M 48 84 V 44 H 88" />
        <path d="M 192 84 V 44 H 152" />
        <path d="M 48 156 V 196 H 88" />
        <path d="M 192 156 V 196 H 152" />
      </g>
      <g stroke="#BE6A2A" strokeWidth={12} strokeLinecap="square" strokeLinejoin="miter">
        <line x1={99} y1={80} x2={99} y2={160} />
        <line x1={99} y1={120} x2={147} y2={80} />
        <line x1={99} y1={120} x2={147} y2={160} />
      </g>
    </svg>
  );
}
