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
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              <Link href={`/events/${event.id}`} className="hover:underline">
                {event.name}
              </Link>
            </h3>
          </div>
          {/* Other event details */}
        </div>
      ))}
    </div>
  );
} 