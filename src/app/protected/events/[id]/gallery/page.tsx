import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { GalleryLayout } from '@/components/gallery/GalleryLayout';
import { EventGallery, PhotoItem } from '@/components/gallery/EventGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { mockGalleries } from '@/components/gallery/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Filter, Download, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const metadata = {
  title: 'Event Gallery | Cloud Burst',
  description: 'View and manage photos for your event',
}

interface PageProps {
  params: {
    id: string;
  }
}

export default async function EventGalleryPage({ params }: PageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Try to fetch event data from database
  const { data: event } = await supabase
    .from('events')
    .select('id, name, date, location, description, status')
    .eq('id', params.id)
    .single();
  
  // Fallback to mock data if no real event data found
  if (!event) {
    const mockGallery = mockGalleries[params.id];
    if (!mockGallery) {
      return notFound();
    }
    
    return (
      <MockGalleryPage eventId={params.id} />
    );
  }
  
  // Fetch the event photos
  let galleryPhotos: PhotoItem[] = []
  try {
    // Fetch approved media for this event
    const { data: mediaItems } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', params.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    console.log(`Found ${mediaItems?.length || 0} approved media items for event ${params.id}`)

    if (mediaItems && mediaItems.length > 0) {
      // Map the media items to the PhotoItem format expected by EventGallery
      galleryPhotos = mediaItems.map(item => ({
        id: item.id,
        url: item.url,
        thumbnail: item.thumbnail_url || item.url,
        title: item.title || 'Untitled',
        description: item.description || '',
        tags: item.tags || [],
        dateUploaded: item.created_at,
        views: item.views || 0,
        likes: item.likes_count || 0,
        downloads: item.downloads_count || 0,
        featured: item.featured || false
      }))
    }
  } catch (error) {
    console.error('Error fetching media for gallery:', error)
    // Fall back to mock data if there's an error or no photos
    galleryPhotos = mockGalleries[params.id]?.photos || []
  }

  if (galleryPhotos.length === 0) {
    console.log('No approved media found, using mock photos')
    galleryPhotos = mockGalleries[params.id]?.photos || []
  }
  
  // Debug the first media item to see its structure
  if (galleryPhotos && galleryPhotos.length > 0) {
    console.log('First gallery photo after mapping:', galleryPhotos[0]);
  }
  
  const header = (
    <div className="flex items-center justify-between w-full">
      <Link href={`/protected/events/${params.id}`} className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold truncate">{event.name}</h1>
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
        <p className="text-sm text-muted-foreground mb-1">{event.date ? new Date(event.date).toLocaleDateString() : 'No date'}</p>
        {event.location && (
          <p className="text-sm text-muted-foreground mb-1">{event.location}</p>
        )}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
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
          <EventGallery 
            eventId={event.id}
            eventName={event.name}
            photos={galleryPhotos}
          />
        </Suspense>
      </div>
    </GalleryLayout>
  );
}

// Fallback component that uses mock data
function MockGalleryPage({ eventId }: { eventId: string }) {
  const mockGallery = mockGalleries[eventId] || mockGalleries['1']; // Fallback to first gallery
  
  const header = (
    <div className="flex items-center justify-between w-full">
      <Link href={`/protected/events/${eventId}`} className="flex items-center">
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
        <p className="text-sm text-muted-foreground mb-1">{new Date(mockGallery.eventDate).toLocaleDateString()}</p>
        <p className="text-sm text-muted-foreground mb-1">{mockGallery.location}</p>
        <p className="text-sm text-muted-foreground line-clamp-3">{mockGallery.description}</p>
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
            <div className="p-3">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 