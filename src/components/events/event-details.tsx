import { Event } from '@/types/events';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, MapPin, Users, Camera, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface EventDetailsProps {
  event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section with Cover Image/Thumbnail */}
      <div className="relative w-full">
        {/* Cover Image or Thumbnail */}
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-muted">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Event Logo (if available) */}
        {event.logo_url && (
          <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full overflow-hidden border-4 border-background">
            <Image
              src={event.logo_url}
              alt={`${event.name} logo`}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Event Header */}
      <div className="space-y-4 pt-8">
        <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {/* Handle both start_date and date fields */}
            <span>{formatDate(event.start_date || event.date)}</span>
            {event.end_date && (event.start_date || event.date) && event.end_date !== (event.start_date || event.date) && (
              <span> - {formatDate(event.end_date)}</span>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Event Description */}
      {event.description && (
        <div className="prose max-w-none dark:prose-invert">
          <p>{event.description}</p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href={`/events/${event.id}/gallery`}>
            <Camera className="mr-2 h-4 w-4" />
            View Gallery
          </Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link href={`/events/${event.id}/upload`}>
            Upload Photos
          </Link>
        </Button>
      </div>
    </div>
  );
} 