import { Event } from '@/types/events';
import { getEventUrl } from '@/lib/utils';
import Link from 'next/link';

interface EventSummaryProps {
  event: Event;
}

export function EventSummary({ event }: EventSummaryProps) {
  return (
    <div className="border p-4 rounded-md">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">
          <Link href={`/events/${event.id}`} className="hover:underline">
            {event.name}
          </Link>
        </h3>
        {/* Other event summary details */}
      </div>
    </div>
  );
} 