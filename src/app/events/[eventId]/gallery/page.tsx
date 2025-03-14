import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SlidersHorizontal, Upload, Image, Shield, ArrowLeft } from 'lucide-react'

import { getUserAuth } from '@/lib/auth/utils'
import { getEventById } from '@/lib/supabase/events'
import { getEventMedia } from '@/lib/supabase/media'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { EventGalleryContent } from './event-gallery-content'

interface EventGalleryPageProps {
  params: {
    eventId: string
  }
}

/**
 * Page for displaying the gallery for a specific event
 */
export default async function EventGalleryPage({ params }: EventGalleryPageProps) {
  // Get current user
  const { session } = await getUserAuth()
  const userId = session?.user?.id
  
  // Get event data
  const event = await getEventById(params.eventId)
  if (!event) {
    notFound()
  }
  
  // Check if user is the organizer
  const isOrganizer = userId && event.organizer_id === userId
  
  // Get media data
  const media = await getEventMedia(params.eventId)
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 h-8 w-8 p-0"
              asChild
            >
              <Link href="/protected/gallery/events" aria-label="Back to dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Event Gallery</h1>
          </div>
          <p className="text-muted-foreground">
            {event.name} - Browse and share event media
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOrganizer && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href={`/events/${params.eventId}/gallery/moderation`}>
                <Shield className="h-4 w-4 mr-2" />
                Moderate
              </Link>
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm"
            asChild
          >
            <Link href={`/protected/gallery/upload?eventId=${params.eventId}`}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Link>
          </Button>
        </div>
      </div>
      
      <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
        {media.length === 0 ? (
          <EmptyState
            icon={<Image className="h-10 w-10 text-muted-foreground" />}
            title="No Media Yet"
            description="Be the first to upload photos and videos from this event."
            action={
              <Button asChild>
                <Link href={`/protected/gallery/upload?eventId=${params.eventId}`}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Link>
              </Button>
            }
          />
        ) : (
          <EventGalleryContent 
            media={media} 
            eventId={params.eventId}
            userId={userId || ''}
          />
        )}
      </Suspense>
    </div>
  )
} 