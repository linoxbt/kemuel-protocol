type NavLabelProps = {
  index: '01' | '02' | '03';
  label: string;
  href?: string;
};

/**
 * `[ 01 · LABEL ]` device — reserved for the three-primitive sequence
 * (registry → two consumers). Do not reuse for non-sequential labels.
 */
export function NavLabel({ index, label, href }: NavLabelProps) {
  const inner = (
    <>
      <span className="text-line">[</span>
      <span className="text-seal px-1">{index}</span>
      <span className="text-line">·</span>
      <span className="px-1">{label}</span>
      <span className="text-line">]</span>
    </>
  );

  const classes =
    'font-mono text-xs tracking-[0.08em] uppercase text-paper-dim inline-flex items-center';

  if (href) {
    return (
      <a href={href} className={`${classes} hover:text-paper transition-colors`}>
        {inner}
      </a>
    );
  }

  return <p className={classes}>{inner}</p>;
}
