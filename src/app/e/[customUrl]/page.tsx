import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { Event } from '@/types/events';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, MapPin, Users, Camera } from 'lucide-react';

type Props = {
  params: {
    customUrl: string;
  };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await getServerSupabase();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('custom_url', params.customUrl)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found | Cloud Burst',
      description: 'The requested event could not be found.',
    };
  }

  return {
    title: `${event.title} | Cloud Burst`,
    description: event.description || 'View event details and photos',
    openGraph: {
      images: event.cover_image ? [event.cover_image] : [],
    },
  };
}

export default async function EventByCustomUrlPage({ params }: Props) {
  const supabase = await getServerSupabase();
  
  // Fetch event by custom_url
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('custom_url', params.customUrl)
    .single();
  
  if (!event) {
    notFound();
  }
  
  return (
    <div className="container py-8 space-y-8">
      {/* Cover Image */}
      {event.cover_image && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
          <img
            src={event.cover_image}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      {/* Event Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{event.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{formatDate(event.start_date)}</span>
            {event.end_date && event.end_date !== event.start_date && (
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