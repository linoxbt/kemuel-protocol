'use client';

import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation"
        className="font-mono text-sm text-paper"
      >
        [ ☰ ]
      </button>
      {open ? (
        <div className="absolute right-0 top-full mt-2 flex flex-col gap-3 border border-line bg-ink-raised p-4">
          <a
            href="/collateral"
            className="font-mono text-xs uppercase tracking-wide text-paper-dim hover:text-paper"
            onClick={() => setOpen(false)}
          >
            Collateral
          </a>
          <a
            href="/revenue"
            className="font-mono text-xs uppercase tracking-wide text-paper-dim hover:text-paper"
            onClick={() => setOpen(false)}
          >
            Revenue
          </a>
        </div>
      ) : null}
    </div>
  );
}
