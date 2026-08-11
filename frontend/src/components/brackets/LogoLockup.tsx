import { BracketMark } from '@/components/icons/BracketMark';

type LogoLockupProps = {
  size?: 'sm' | 'lg';
  withSubline?: boolean;
};

/** `[ KEMUEL ]` wordmark lockup — brackets in `line`, wordmark in `paper`,
 * PROTOCOL subline tracked wide beneath. */
export function LogoLockup({ size = 'sm', withSubline = false }: LogoLockupProps) {
  const wordSize = size === 'lg' ? 'text-2xl' : 'text-sm';
  const iconSize = size === 'lg' ? 28 : 18;

  return (
    <a href="/" className="group inline-flex items-center gap-2 font-mono">
      <BracketMark size={iconSize} className="text-paper" />
      <span className={`flex items-baseline gap-1.5 ${wordSize}`}>
        <span className="text-line">[</span>
        <span className="font-semibold text-paper group-hover:text-seal-bright transition-colors">
          KEMUEL
        </span>
        <span className="text-line">]</span>
        {withSubline ? (
          <span className="ml-1.5 text-[10px] tracking-[0.2em] text-paper-dim">PROTOCOL</span>
        ) : null}
      </span>
    </a>
  );
}
