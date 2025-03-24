import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase/events.server';
import { getApprovedEventMedia } from '@/lib/supabase/media.server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { AlbumCreationForm } from '@/components/media/AlbumCreationForm';

interface AlbumCreatePageProps {
  params: {
    eventId: string;
  };
}

export async function generateMetadata({ params }: AlbumCreatePageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  
  if (!event) {
    return {
      title: 'Event not found',
    };
  }
  
  return {
    title: `Create Album - ${event.name} | Cloud Burst`,
    description: `Create a new album for ${event.name}`,
  };
}

export default async function AlbumCreatePage({ params }: AlbumCreatePageProps) {
  const { eventId } = params;
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/events');
  }
  
  // Get approved media to select from for the album
  const media = await getApprovedEventMedia(eventId);
  
  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/events/${eventId}/media`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Album for {event.name}</CardTitle>
          <CardDescription>
            Create an album to organize photos and videos from this event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                There are no approved media items available to add to an album.
              </p>
              <Button asChild>
                <Link href={`/events/${eventId}/media/upload`}>
                  Upload Media First
                </Link>
              </Button>
            </div>
          ) : (
            <AlbumCreationForm eventId={eventId} availableMedia={media} />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Albums help organize your event media for easier browsing.
          </p>
          <Button asChild variant="outline">
            <Link href={`/events/${eventId}/media`}>Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 