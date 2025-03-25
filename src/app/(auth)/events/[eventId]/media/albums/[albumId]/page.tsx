import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase/events.server';
import { getAlbumById, getAlbumMedia } from '@/lib/supabase/media.server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import { MediaGrid } from '@/components/media/MediaGrid';

interface AlbumViewPageProps {
  params: {
    eventId: string;
    albumId: string;
  };
}

export async function generateMetadata({ params }: AlbumViewPageProps): Promise<Metadata> {
  const album = await getAlbumById(params.albumId);
  
  if (!album) {
    return {
      title: 'Album not found',
    };
  }
  
  return {
    title: `${album.title} | Cloud Burst`,
    description: album.description || `View photos and videos in the album ${album.title}`,
  };
}

export default async function AlbumViewPage({ params }: AlbumViewPageProps) {
  const { eventId, albumId } = params;
  const album = await getAlbumById(albumId);
  
  if (!album) {
    redirect(`/events/${eventId}/media`);
  }
  
  const media = await getAlbumMedia(albumId);
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/events/${eventId}/media`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Link>
          </Button>
        </div>
        
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${eventId}/media/albums/${albumId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Album
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{album.title}</h1>
        {album.description && (
          <p className="text-muted-foreground mt-2">{album.description}</p>
        )}
      </div>
      
      {media.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No media in this album</CardTitle>
            <CardDescription>
              This album is empty. Add some media to see it here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/events/${eventId}/media/albums/${albumId}/edit`}>
                Add Media to Album
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MediaGrid 
          media={media} 
          showControls={false}
          className="py-4"
        />
      )}
    </div>
  );
} 