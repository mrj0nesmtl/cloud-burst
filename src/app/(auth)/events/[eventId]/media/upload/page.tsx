import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase/events.server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaUploader } from '@/components/media/MediaUploader';
import { ArrowLeft } from 'lucide-react';

interface MediaUploadPageProps {
  params: {
    eventId: string;
  };
}

export async function generateMetadata({ params }: MediaUploadPageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  
  if (!event) {
    return {
      title: 'Event not found',
    };
  }
  
  return {
    title: `Upload Media - ${event.name} | Cloud Burst`,
    description: `Upload photos and videos for ${event.name}`,
  };
}

export default async function MediaUploadPage({ params }: MediaUploadPageProps) {
  const { eventId } = params;
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/events');
  }
  
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
          <CardTitle>Upload Media for {event.name}</CardTitle>
          <CardDescription>
            Upload photos and videos to share with event participants. Supported formats include JPG, PNG, GIF, and MP4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaUploader eventId={eventId} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Media will be reviewed before appearing in the gallery.
          </p>
          <Button asChild variant="outline">
            <Link href={`/events/${eventId}/media`}>Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 