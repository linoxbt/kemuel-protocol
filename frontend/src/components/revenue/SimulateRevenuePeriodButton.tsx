'use client';

import { BracketButton } from '@/components/brackets/BracketButton';
import { StepIndicator } from '@/components/brackets/StepIndicator';
import { useSimulateRevenuePeriod } from '@/lib/data-source';

export function SimulateRevenuePeriodButton() {
  const { run, stage, failedReason } = useSimulateRevenuePeriod();

  if (stage !== 'idle') {
    return <StepIndicator stage={stage} failedReason={failedReason} />;
  }

  return (
    <BracketButton onClick={() => run()} ariaLabel="Simulate a revenue period">
      SIMULATE REVENUE PERIOD
    </BracketButton>
  );
}
