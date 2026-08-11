import { EXPLORER_BASE_URL, BOT_CHAIN_ID } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-6 py-8 font-mono text-xs text-paper-dim sm:flex-row sm:items-center">
        <a
          href="https://github.com/linoxbt/kemuel-protocol"
          target="_blank"
          rel="noreferrer"
          className="hover:text-paper"
        >
          [ GITHUB ]
        </a>
        <a href={EXPLORER_BASE_URL} target="_blank" rel="noreferrer" className="hover:text-paper">
          [ SCAN.BOTCHAIN.AI ]
        </a>
        <span className="text-line">[ BOT CHAIN · {BOT_CHAIN_ID} ]</span>
      </div>
    </footer>
  );
}
