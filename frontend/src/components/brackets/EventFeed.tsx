import type { FeedEvent } from '@/lib/types';
import { EventFeedRow } from './EventFeedRow';

type EventFeedProps = {
  events: FeedEvent[];
  emptyLabel?: string;
};

export function EventFeed({ events, emptyLabel = 'No events yet.' }: EventFeedProps) {
  if (events.length === 0) {
    return <p className="font-mono text-[12.5px] text-paper-dim">{emptyLabel}</p>;
  }

  return (
    <div>
      {events.map((event, index) => (
        <EventFeedRow key={event.id} event={event} isNew={index === 0} />
      ))}
    </div>
  );
}
