import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase/events.server';
import { getPendingEventMedia } from '@/lib/supabase/media.server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { MediaModerationGrid } from '@/components/media/MediaModerationGrid';
import { auth } from '@/lib/auth';

interface ModerationPageProps {
  params: {
    eventId: string;
  };
}

export async function generateMetadata({ params }: ModerationPageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  
  if (!event) {
    return {
      title: 'Event not found',
    };
  }
  
  return {
    title: `Moderate Media - ${event.name} | Cloud Burst`,
    description: `Review and moderate media submissions for ${event.name}`,
  };
}

export default async function ModerationPage({ params }: ModerationPageProps) {
  const { eventId } = params;
  const event = await getEventById(eventId);
  
  // Check if the current user is authorized to moderate
  const { session } = await auth();
  
  if (!event) {
    redirect('/events');
  }
  
  // Check if the user is an organizer or staff for this event
  const isOrganizer = event.user_id === session?.user?.id;
  const isStaff = event.staff?.some(staff => staff.user_id === session?.user?.id);
  
  if (!isOrganizer && !isStaff) {
    redirect(`/events/${eventId}/media`);
  }
  
  const pendingMedia = await getPendingEventMedia(eventId);
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/events/${eventId}/media`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Moderation</h1>
        <p className="text-muted-foreground">
          Review and approve or reject media submissions for {event.name}
        </p>
      </div>
      
      {pendingMedia.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Pending Media</CardTitle>
            <CardDescription>
              There are no media submissions waiting for moderation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/events/${eventId}/media`}>
                Return to Gallery
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {pendingMedia.length} {pendingMedia.length === 1 ? 'item' : 'items'} pending review
          </p>
          
          <MediaModerationGrid 
            media={pendingMedia} 
            eventId={eventId}
            className="py-4"
          />
        </div>
      )}
    </div>
  );
} 