'use client';

import { BracketButton } from '@/components/brackets/BracketButton';
import { StepIndicator } from '@/components/brackets/StepIndicator';
import { useSimulateAttestation } from '@/lib/data-source';

export function SimulateAttestationButton() {
  const { run, stage, failedReason } = useSimulateAttestation();

  if (stage !== 'idle') {
    return <StepIndicator stage={stage} failedReason={failedReason} />;
  }

  return (
    <BracketButton onClick={() => run()} ariaLabel="Simulate a new attestation">
      SIMULATE NEW ATTESTATION
    </BracketButton>
  );
}
