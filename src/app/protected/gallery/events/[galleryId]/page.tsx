import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings, Upload } from 'lucide-react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserGalleriesServer } from '@/lib/supabase/galleries.server'
import { getEvent } from '@/lib/supabase/events.server'
import { Gallery } from '@/types/gallery'
import { MasonryGrid } from '@/components/gallery'
import { MediaItem } from '@/components/gallery/MediaCard'
import { MediaStatus } from '@/types/media'

interface GalleryViewPageProps {
  params: {
    galleryId: string
  }
}

export default async function GalleryViewPage({ params }: GalleryViewPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    redirect('/auth/signin?returnTo=/protected/gallery/events')
  }
  
  // Get the gallery
  try {
    // Get user galleries to verify access using the server-side function
    const userGalleries = await getUserGalleriesServer()
    
    if (!userGalleries || userGalleries.length === 0) {
      console.error('No galleries found for user')
      throw new Error('No galleries found')
    }
    
    const gallery = userGalleries.find((g: Gallery) => g.id === params.galleryId)
    
    if (!gallery) {
      // User doesn't have access to this gallery
      redirect('/protected/gallery/events')
    }
    
    // Get the event data for the gallery
    const event = await getEvent(gallery.event_id)
    
    // Get photos for this event
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', gallery.event_id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    
    if (photosError) {
      console.error('Error fetching photos:', photosError)
      throw new Error('Failed to load gallery photos')
    }
    
    // Map photos to MediaItem format
    const mediaItems: MediaItem[] = photos ? photos.map(photo => ({
      id: photo.id,
      title: photo.title || '',
      description: photo.description || '',
      media_type: photo.type === 'video' ? 'video' : 'photo',
      url: photo.url,
      thumbnail_url: photo.thumbnail_url || photo.url,
      created_at: photo.created_at,
      width: photo.width || 1200,
      height: photo.height || 800,
      status: photo.is_approved ? MediaStatus.APPROVED : MediaStatus.PENDING,
      comments: photo.comments || [],
      event: {
        id: event.id,
        name: event.name
      },
      event_id: event.id
    })) : []
    
    return (
      <div className="container py-6 space-y-6 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 h-8 w-8 p-0"
              asChild
            >
              <Link href="/protected/gallery/events" aria-label="Back to galleries">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{event.name || 'Event Gallery'}</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href={`/protected/gallery/events/${params.galleryId}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              asChild
            >
              <Link href={`/protected/gallery/upload?eventId=${event.id}`}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Link>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Gallery</CardTitle>
            <CardDescription>
              {mediaItems.length 
                ? `Showing ${mediaItems.length} photos from this event` 
                : "No photos found for this event yet. Upload some media to get started!"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mediaItems.length > 0 ? (
              <MasonryGrid items={mediaItems} showComments={true} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No media items found in this gallery.</p>
                <Button asChild>
                  <Link href={`/protected/gallery/upload?eventId=${event.id}`}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading gallery:', error)
    return (
      <div className="container py-6">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/protected/gallery/events">
                Return to Galleries
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
} 