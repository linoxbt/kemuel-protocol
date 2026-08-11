'use client';

import type { ReactNode } from 'react';

type BracketButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

const sharedClasses =
  'inline-flex items-center gap-1 font-mono text-[13px] tracking-wide text-paper transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
const bracketClasses = 'text-line group-hover:text-seal-bright transition-colors duration-150';

/**
 * The site's signature CTA — literal `[ LABEL ]` bracket characters, no
 * fill, no border-radius. Brackets and label shift to seal on hover/focus.
 */
export function BracketButton({
  children,
  onClick,
  href,
  type = 'button',
  disabled,
  ariaLabel,
  className = '',
}: BracketButtonProps) {
  const content = (
    <>
      <span className={bracketClasses}>[</span>
      <span className="group-hover:text-seal-bright px-1">{children}</span>
      <span className={bracketClasses}>]</span>
    </>
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={`group ${sharedClasses} ${className}`}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`group ${sharedClasses} ${className}`}
    >
      {content}
    </button>
  );
}
