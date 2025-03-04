import { Event } from '@/types/events';
import { getEventUrl } from '@/lib/utils';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={getEventUrl(event)} className="block">
      {/* Your event card content */}
    </Link>
  );
} 