import { notFound } from "next/navigation";
import { Media, MediaStatus } from "@/types/media";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  PlusCircle, 
  Upload
} from 'lucide-react';
import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase/events.server';
import { getApprovedEventMedia } from '@/lib/supabase/media.server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface MediaPageProps {
  params: {
    eventId: string;
  };
}

export async function generateMetadata({ params }: MediaPageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  
  if (!event) {
    return {
      title: 'Event not found',
    };
  }
  
  return {
    title: `${event.name} - Media Gallery | Cloud Burst`,
    description: `Browse photos and videos from ${event.name}`,
  };
}

export default async function MediaPage({ params }: MediaPageProps) {
  const { eventId } = params;
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/events');
  }
  
  const media = await getApprovedEventMedia(eventId);
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name} - Media Gallery</h1>
          <p className="text-muted-foreground">Browse and manage photos and videos from this event</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/events/${eventId}/media/upload`}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Link>
          </Button>
          
          <Button asChild>
            <Link href={`/events/${eventId}/media/albums/create`}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Album
            </Link>
          </Button>
        </div>
      </div>
      
      {media.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No media yet</CardTitle>
            <CardDescription>
              This event doesn't have any media yet. Upload some photos or videos to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/events/${eventId}/media/upload`}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Media
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MediaGrid 
          media={media} 
          showControls={true}
          className="py-4"
        />
      )}
    </div>
  );
} 