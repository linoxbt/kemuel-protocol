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
      <div className="flex items-center">
        {STAGES.map((s, index) => {
          const isComplete = !failed && activeIndex > index;
          const isActive = !failed && activeIndex === index;
          const isLast = index === STAGES.length - 1;

          return (
            <div key={s.key} className="flex flex-1 items-center last:flex-none">
              <span
                className={`whitespace-nowrap font-mono text-[11px] tracking-wide ${
                  isComplete ? 'text-seal' : isActive ? 'text-paper animate-label-pulse' : 'text-line'
                } ${failed && index === Math.max(activeIndex, 0) ? 'text-critical' : ''}`}
              >
                {s.label}
              </span>
              {!isLast ? (
                <span
                  className={`mx-2 h-px flex-1 ${isComplete ? 'bg-seal' : 'bg-line'}`}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {failed && failedReason ? (
        <p className="mt-2 font-mono text-[11.5px] text-critical">{failedReason}</p>
      ) : null}
    </div>
  );
}
