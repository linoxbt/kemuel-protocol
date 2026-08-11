import { EXPLORER_BASE_URL } from '@/lib/constants';
import { truncateHash, timeAgo } from '@/lib/format';
import type { FeedEvent } from '@/lib/types';

type EventFeedRowProps = {
  event: FeedEvent;
  isNew?: boolean;
};

/** Manifest-style row — `[ TX ] 0x4f2a…9c11 · LoanOpened · 2m ago ↗` —
 * links out to the explorer. Wraps to two lines on mobile instead of
 * truncating the link away. */
export function EventFeedRow({ event, isNew }: EventFeedRowProps) {
  return (
    <a
      href={`${EXPLORER_BASE_URL}/tx/${event.txHash}`}
      target="_blank"
      rel="noreferrer"
      className={`group flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line py-2.5 font-mono text-[12.5px] text-paper-dim last:border-b-0 hover:text-paper ${
        isNew ? 'animate-row-in' : ''
      }`}
    >
      <span className="flex flex-wrap items-center gap-x-2">
        <span className="text-line">[ TX ]</span>
        <span className="text-paper group-hover:text-seal-bright">
          {truncateHash(event.txHash)}
        </span>
        <span className="text-line">·</span>
        <span>{event.kind}</span>
        {event.detail ? (
          <>
            <span className="text-line">·</span>
            <span>{event.detail}</span>
          </>
        ) : null}
      </span>
      <span className="flex items-center gap-1 whitespace-nowrap">
        {timeAgo(event.timestamp)}
        <span className="text-line group-hover:text-seal-bright" aria-hidden>
          ↗
        </span>
      </span>
    </a>
  );
}
