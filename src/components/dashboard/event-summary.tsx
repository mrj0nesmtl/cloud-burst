import { Event } from '@/types/events';
import { getEventUrl } from '@/lib/utils';
import Link from 'next/link';

interface EventSummaryProps {
  event: Event;
}

export function EventSummary({ event }: EventSummaryProps) {
  return (
    <div className="border p-4 rounded-md">
      <h3 className="font-medium">
        <Link href={getEventUrl(event)} className="hover:underline">
          {event.title}
        </Link>
      </h3>
      {/* Other event summary details */}
    </div>
  );
} 