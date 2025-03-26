import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { MasonryLayout } from '@/components/gallery/masonry-layout'
import { Photo } from '@/types/events'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface GalleryPageProps {
  params: {
    eventId: string
  }
}

function convertDatabasePhotoToPhotoType(photo: any, eventId: string): Photo {
  return {
    id: photo.id,
    event_id: photo.event_id || eventId,
    filename: photo.filename || '',
    storage_path: photo.storage_path || '',
    is_approved: Boolean(photo.is_approved),
    metadata: {},  // Initialize with empty object as fallback
    created_at: photo.created_at || new Date().toISOString(),
    updated_at: photo.updated_at || new Date().toISOString(),
    uploaded_by: photo.uploaded_by || null,
    width: photo.width || null,
    height: photo.height || null,
    size: photo.size || 0,
    mime_type: photo.mime_type || '',
    // Optional fields omitted if not present
    ...(photo.url && { url: photo.url }),
    ...(photo.thumbnail_url && { thumbnail_url: photo.thumbnail_url })
  };
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', params.eventId)
    .single()
  
  if (!event) {
    return {
      title: 'Gallery Not Found',
      description: 'The requested gallery could not be found.',
    }
  }
  
  return {
    title: `${event.name} Gallery | Cloud Burst`,
    description: `View photos from ${event.name}`,
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { eventId } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  
  if (eventError || !event) {
    notFound()
  }
  
  // Fetch event photos
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  
  if (photosError) {
    console.error('Error fetching photos:', photosError)
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center border-b px-4 md:px-6 bg-background">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Cloud Burst" width={36} height={36} />
          <span className="text-lg font-semibold">Cloud Burst</span>
        </Link>
        <div className="ml-auto">
          <Link href={`/invitation/${params.eventId}`} passHref>
            <Button variant="outline" size="sm">
              Back to Invitation
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 py-6">
        <div className="container px-4 md:px-6">
          <div className="mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">{event.name} Gallery</h1>
              <p className="text-muted-foreground mt-2">
                Browse and download photos from this event
              </p>
            </div>
            
            {photos && photos.length > 0 ? (
              <div className="mt-8">
                <GalleryGrid 
                  photos={photos.map(photo => convertDatabasePhotoToPhotoType(photo, event.id))}
                  showEventName={false}
                />
              </div>
            ) : (
              <Card className="mx-auto max-w-md">
                <CardHeader>
                  <CardTitle>No Photos Yet</CardTitle>
                  <CardDescription>
                    There are no photos available for this event yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Check back later or contact the event organizer for more information.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cloud Burst. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/privacy" className="underline">Privacy Policy</Link>
            {' • '}
            <Link href="/terms" className="underline">Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  )
} 