type ApertureMarkProps = {
  className?: string;
  size?: number;
};

/** Witness-eye mark — used on the landing page's Collateral Vault specimen
 * (continuous scanning of attested collateral). */
export function ApertureMark({ className, size = 24 }: ApertureMarkProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Kemuel Protocol — the aperture"
    >
      <path
        d="M 20 120 Q 120 34 220 120 Q 120 206 20 120 Z"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <circle cx={120} cy={120} r={46} stroke="currentColor" strokeWidth={3.5} />
      <line
        x1={24}
        y1={120}
        x2={60}
        y2={120}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray="1 6"
        strokeLinecap="round"
      />
      <line
        x1={180}
        y1={120}
        x2={216}
        y2={120}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray="1 6"
        strokeLinecap="round"
      />
      <line x1={120} y1={60} x2={120} y2={78} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <line x1={120} y1={162} x2={120} y2={180} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <circle cx={120} cy={120} r={15} fill="#BE6A2A" />
    </svg>
  );
}
