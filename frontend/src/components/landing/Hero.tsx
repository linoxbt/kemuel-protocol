import { BracketButton } from '@/components/brackets/BracketButton';
import { BOT_CHAIN_ID, BOT_CHAIN_NAME } from '@/lib/constants';

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-32">
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.1em] text-seal sm:mb-6">
        [ Continuous-truth oracle ]
      </p>
      <h1 className="max-w-3xl text-balance font-display text-[clamp(2.25rem,9vw,5.5rem)] leading-[1.06] text-paper">
        One registry. Two consumers. No human in the loop.
      </h1>
      <p className="mt-5 max-w-xl font-body text-[15px] text-paper-dim sm:mt-6 sm:text-base">
        Kemuel Protocol reads physical evidence and live revenue data, produces signed,
        confidence-scored attestations, and lets two autonomous financial primitives act
        on that truth in real time.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 sm:mt-10">
        <BracketButton href="/dashboard" ariaLabel="Launch app — open the dashboard">
          LAUNCH APP
        </BracketButton>
        <BracketButton href="#primitives" ariaLabel="See how it works">
          HOW IT WORKS
        </BracketButton>
      </div>
      <p className="mt-8 font-mono text-[11px] uppercase tracking-wide text-paper-dim sm:mt-10">
        Live on {BOT_CHAIN_NAME} · chain {BOT_CHAIN_ID} · AI-signed attestations
      </p>
    </section>
  );
}
