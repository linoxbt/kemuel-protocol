import { Hero } from '@/components/landing/Hero';
import { PrimitiveSection } from '@/components/landing/PrimitiveSection';
import { LtvBar } from '@/components/brackets/LtvBar';
import { SealMark } from '@/components/icons/SealMark';
import { ApertureMark } from '@/components/icons/ApertureMark';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <div id="primitives" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-24">
        <PrimitiveSection
          index="01"
          title="ATTESTATION ENGINE"
          description="An AI agent reads physical evidence or live business revenue data and produces signed, confidence-scored attestations — the only piece of state the two vaults below share."
          specimen={
            <div className="flex w-full items-center gap-4">
              <SealMark size={40} className="shrink-0 text-paper" />
              <code className="font-mono text-[11px] leading-relaxed text-paper-dim">
                [ assetId,
                <br />
                &nbsp;&nbsp;confidenceBps: 8600,
                <br />
                &nbsp;&nbsp;dataHash ]
              </code>
            </div>
          }
        />
        <PrimitiveSection
          index="02"
          title="COLLATERAL VAULT"
          description="Opens loans against attested physical collateral and autonomously executes margin calls and liquidations when attested value degrades."
          specimen={
            <div className="w-full">
              <ApertureMark size={32} className="mb-4 text-paper" />
              <LtvBar ltvBps={6200} liquidationThresholdBps={8000} />
            </div>
          }
          ctaHref="/collateral"
          ctaLabel="OPEN COLLATERAL VAULT"
        />
        <PrimitiveSection
          index="03"
          title="REVENUE BOND VAULT"
          description="Issues revenue-share financing against attested revenue data and autonomously prices and repays it in real time as new periods settle."
          specimen={
            <p className="font-mono text-[11px] text-paper-dim">
              [ RevenueSettled ] repayment <span className="text-paper">$2,500.00</span> ·
              outstanding <span className="text-paper">$17,500.00</span>
            </p>
          }
          ctaHref="/revenue"
          ctaLabel="OPEN REVENUE BONDS"
        />
      </div>
    </>
  );
}
