type SealMarkProps = {
  className?: string;
  size?: number;
};

/** Notary-seal mark — used on the landing page's Attestation Engine specimen. */
export function SealMark({ className, size = 24 }: SealMarkProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Kemuel Protocol — the seal"
    >
      <circle
        cx={120}
        cy={120}
        r={100}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <circle cx={120} cy={120} r={88} stroke="currentColor" strokeWidth={2} />
      <path
        d="M 120 20 A 100 100 0 0 1 155 26.8"
        stroke="#BE6A2A"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth={11} strokeLinecap="square" strokeLinejoin="miter">
        <line x1={93} y1={72} x2={93} y2={168} />
        <line x1={93} y1={120} x2={150} y2={72} />
        <line x1={93} y1={120} x2={150} y2={168} />
      </g>
      <circle cx={150} cy={168} r={5.5} fill="#BE6A2A" />
    </svg>
  );
}
