import type { StepStage } from '@/lib/types';

const STAGES: { key: StepStage; label: string }[] = [
  { key: 'calling-ai', label: 'CALLING AI' },
  { key: 'signing', label: 'SIGNING' },
  { key: 'submitting', label: 'SUBMITTING ON-CHAIN' },
  { key: 'confirmed', label: 'CONFIRMED' },
];

type StepIndicatorProps = {
  stage: StepStage;
  failedReason?: string;
};

/** Four-stage procedural indicator shown inline when a "Simulate" button is
 * clicked. Advances left-to-right; connector line fills with seal as each
 * stage completes; active label pulses opacity (not a spinner). */
export function StepIndicator({ stage, failedReason }: StepIndicatorProps) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);
  const failed = stage === 'failed';

  return (
    <div className="w-full">
      {/* Below sm: a 2-column grid, no connector lines — fitting all four
       * labels (including "SUBMITTING ON-CHAIN") on one nowrap row would
       * overflow narrow screens. At sm+: the original single-row flow with
       * connector lines. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:items-center sm:gap-0">
        {STAGES.map((s, index) => {
          const isComplete = !failed && activeIndex > index;
          const isActive = !failed && activeIndex === index;
          const isLast = index === STAGES.length - 1;
          const isFailedHere = failed && index === Math.max(activeIndex, 0);

          return (
            <div key={s.key} className="flex items-center sm:flex-1 sm:last:flex-none">
              <span
                className={`whitespace-nowrap font-mono text-[11px] tracking-wide ${
                  isComplete ? 'text-seal' : isActive ? 'text-paper animate-label-pulse' : 'text-line'
                } ${isFailedHere ? 'text-critical' : ''}`}
              >
                {s.label}
              </span>
              {!isLast ? (
                <span
                  className={`mx-2 hidden h-px flex-1 sm:block ${isComplete ? 'bg-seal' : 'bg-line'}`}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {failed && failedReason ? (
        <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-critical">{failedReason}</p>
      ) : null}
    </div>
  );
}
