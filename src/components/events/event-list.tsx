import { Event } from '@/types/events';
import { getEventUrl } from '@/lib/utils';
import Link from 'next/link';

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border p-4 rounded-md">
          <Link href={getEventUrl(event)} className="font-medium hover:underline">
            {event.title}
          </Link>
          {/* Other event details */}
        </div>
      ))}
    </div>
  );
} 