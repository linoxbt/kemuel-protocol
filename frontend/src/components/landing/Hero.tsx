import { BracketButton } from '@/components/brackets/BracketButton';

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 sm:pt-32">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-seal">
        [ Continuous-truth oracle ]
      </p>
      <h1 className="max-w-3xl font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] text-paper">
        One registry. Two consumers. No human in the loop.
      </h1>
      <p className="mt-6 max-w-xl font-body text-base text-paper-dim">
        Kemuel Protocol reads physical evidence and live revenue data, produces signed,
        confidence-scored attestations, and lets two autonomous financial primitives act
        on that truth in real time.
      </p>
      <div className="mt-10">
        <BracketButton href="#primitives" ariaLabel="Launch app — jump to the three primitives">
          LAUNCH APP
        </BracketButton>
      </div>
    </section>
  );
}
