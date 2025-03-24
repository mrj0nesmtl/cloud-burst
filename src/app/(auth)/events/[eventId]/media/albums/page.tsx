import { Metadata } from 'next';
import { getEventById } from '@/lib/supabase/events.server';
import { getEventAlbums } from '@/lib/supabase/media.server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Image from 'next/image';

interface AlbumsPageProps {
  params: {
    eventId: string;
  };
}

export async function generateMetadata({ params }: AlbumsPageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  
  if (!event) {
    return {
      title: 'Event not found',
    };
  }
  
  return {
    title: `Albums - ${event.name} | Cloud Burst`,
    description: `Browse photo and video albums from ${event.name}`,
  };
}

export default async function AlbumsPage({ params }: AlbumsPageProps) {
  const { eventId } = params;
  const event = await getEventById(eventId);
  
  if (!event) {
    redirect('/events');
  }
  
  const albums = await getEventAlbums(eventId);
  
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
        
        <Button asChild>
          <Link href={`/events/${eventId}/media/albums/create`}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Album
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Albums - {event.name}</h1>
        <p className="text-muted-foreground">
          Browse curated collections of photos and videos from this event
        </p>
      </div>
      
      {albums.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Albums</CardTitle>
            <CardDescription>
              There are no albums for this event yet. Create the first one!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/events/${eventId}/media/albums/create`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Album
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link 
              key={album.id} 
              href={`/events/${eventId}/media/albums/${album.id}`}
              className="group"
            >
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {album.cover_url ? (
                    <Image
                      src={album.cover_url}
                      alt={album.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No cover image
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">{album.title}</CardTitle>
                </CardHeader>
                {album.description && (
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {album.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 