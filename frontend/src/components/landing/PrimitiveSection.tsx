import type { ReactNode } from 'react';
import { NavLabel } from '@/components/brackets/NavLabel';
import { BracketButton } from '@/components/brackets/BracketButton';

type PrimitiveSectionProps = {
  index: '01' | '02' | '03';
  title: string;
  description: string;
  specimen: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

export function PrimitiveSection({
  index,
  title,
  description,
  specimen,
  ctaHref,
  ctaLabel,
}: PrimitiveSectionProps) {
  return (
    <div className="grid gap-6 border-t border-line py-10 sm:grid-cols-2 sm:gap-16 sm:py-14">
      <div>
        <NavLabel index={index} label={title} />
        <p className="mt-4 max-w-md font-body text-sm text-paper-dim">{description}</p>
        {ctaHref && ctaLabel ? (
          <div className="mt-6">
            <BracketButton href={ctaHref}>{ctaLabel}</BracketButton>
          </div>
        ) : null}
      </div>
      <div className="flex items-center border border-line bg-ink-raised p-5 sm:p-6">{specimen}</div>
    </div>
  );
}
