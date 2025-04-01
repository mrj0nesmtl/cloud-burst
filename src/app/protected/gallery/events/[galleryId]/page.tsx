import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { GalleryLayout } from '@/components/gallery/GalleryLayout';
import { EventGallery } from '@/components/gallery/EventGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { mockGalleries } from '@/components/gallery/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Filter, Download, ChevronLeft, Upload, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const metadata = {
  title: 'Event Gallery | Cloud Burst',
  description: 'View and manage photos for your event',
}

interface PageProps {
  params: {
    galleryId: string;
  }
}

export default async function EventGalleryPage({ params }: PageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Try to fetch event data from database
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, name, date, location, description, status')
    .eq('id', params.galleryId)
    .single();
  
  if (eventError) {
    console.error('Error fetching event:', eventError);
  }
  
  // If no event data, check if gallery record exists first
  if (!event) {
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, event_id')
      .eq('event_id', params.galleryId)
      .single();
    
    if (galleryError || !gallery) {
      // If no gallery or event exists, try mock data
      const mockGallery = mockGalleries[params.galleryId];
      if (!mockGallery) {
        return (
          <EmptyGalleryPage galleryId={params.galleryId} />
        );
      }
      
      return (
        <MockGalleryPage eventId={params.galleryId} />
      );
    }
  }
  
  // Fetch photos for this event
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', params.galleryId)
    .order('created_at', { ascending: false });
  
  // If no photos found, use mock photos instead
  const mockGallery = mockGalleries[params.galleryId] || mockGalleries['1']; // Fallback to first gallery if no match
  const galleryPhotos = photos?.length ? 
    photos.map(photo => ({
      id: photo.id,
      url: photo.url || mockGallery.photos[0].url, // Fallback to mock URL if none exists
      thumbnail: photo.thumbnail_url || photo.url || mockGallery.photos[0].thumbnail,
      title: photo.title || `Photo ${photo.id}`,
      description: photo.description || '',
      tags: photo.tags?.split(',') || [],
      dateUploaded: photo.created_at,
      views: photo.view_count || 0,
      likes: photo.like_count || 0,
      downloads: photo.download_count || 0,
      featured: photo.is_featured || false
    })) : 
    [];
  
  const eventName = event?.name || 'Event Gallery';
  const eventDate = event?.date ? new Date(event.date).toLocaleDateString() : 'No date';
  const eventLocation = event?.location || '';
  const eventDescription = event?.description || '';
  
  const header = (
    <div className="flex items-center justify-between w-full">
      <Link href="/protected/gallery/events" className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold truncate">{eventName}</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button size="sm" className="h-8">
          <Camera className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
  
  const sidebar = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-2">Event Info</h3>
        <p className="text-sm text-muted-foreground mb-1">{eventDate}</p>
        {eventLocation && (
          <p className="text-sm text-muted-foreground mb-1">{eventLocation}</p>
        )}
        {eventDescription && (
          <p className="text-sm text-muted-foreground line-clamp-3">{eventDescription}</p>
        )}
      </div>
      
      <div>
        <h3 className="font-medium text-sm mb-2">Gallery Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Photos</p>
              <p className="text-lg font-bold">{galleryPhotos.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-lg font-bold">{galleryPhotos.reduce((sum, photo) => sum + (photo.views || 0), 0)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-sm mb-2">Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            Share Gallery
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <GalleryLayout header={header} sidebar={sidebar}>
      <div className="p-4">
        <Suspense fallback={<GallerySkeleton />}>
          {galleryPhotos.length > 0 ? (
            <EventGallery 
              eventId={params.galleryId}
              eventName={eventName}
              photos={galleryPhotos}
            />
          ) : (
            <EmptyGalleryContent galleryId={params.galleryId} />
          )}
        </Suspense>
      </div>
    </GalleryLayout>
  );
}

// Empty gallery content with upload prompt
function EmptyGalleryContent({ galleryId }: { galleryId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <ImagePlus className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No photos yet</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        This gallery is empty. Start by uploading photos to create memorable experiences from your event.
      </p>
      <Button asChild>
        <Link href={`/protected/gallery/upload?eventId=${galleryId}`}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Photos
        </Link>
      </Button>
    </div>
  );
}

// Empty gallery page (fallback for non-existent galleries)
function EmptyGalleryPage({ galleryId }: { galleryId: string }) {
  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Gallery Not Found</CardTitle>
          <CardDescription>
            We couldn't find a gallery for this event
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <div className="bg-muted/40 p-6 rounded-full mb-6">
            <ImagePlus className="h-12 w-12 text-muted-foreground/60" />
          </div>
          <p className="text-center text-muted-foreground mb-8 max-w-md">
            The gallery you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/protected/gallery/events">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Galleries
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/protected/events/manage`}>
                View Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fallback component that uses mock data
function MockGalleryPage({ eventId }: { eventId: string }) {
  const mockGallery = mockGalleries[eventId] || mockGalleries['1']; // Fallback to first gallery
  
  const header = (
    <div className="flex items-center justify-between w-full">
      <Link href="/protected/gallery/events" className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold truncate">{mockGallery.eventName}</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button size="sm" className="h-8">
          <Camera className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
  
  const sidebar = (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-2">Event Info</h3>
        <p className="text-sm text-muted-foreground mb-1">Demo Event</p>
        <p className="text-sm text-muted-foreground mb-1">Sample Location</p>
      </div>
      
      <div>
        <h3 className="font-medium text-sm mb-2">Gallery Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Photos</p>
              <p className="text-lg font-bold">{mockGallery.photos.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-lg font-bold">{mockGallery.photos.reduce((sum, photo) => sum + (photo.views || 0), 0)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-sm mb-2">Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            Share Gallery
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <GalleryLayout header={header} sidebar={sidebar}>
      <div className="p-4">
        <EventGallery 
          eventId={mockGallery.eventId}
          eventName={mockGallery.eventName}
          photos={mockGallery.photos}
        />
      </div>
    </GalleryLayout>
  );
}

function GallerySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[3/2] w-full" />
            <div className="p-2">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 