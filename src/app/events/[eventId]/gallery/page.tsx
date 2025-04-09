import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { GuestAuthCheck } from '@/components/gallery/guest-auth-check'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { Calendar, MapPin, Users } from 'lucide-react'
import { UploadButton } from '@/components/gallery/upload-button'

export const revalidate = 0
export const dynamic = 'force-dynamic'

interface EventGalleryPageProps {
  params: { 
    eventId: string 
  }
}

export async function generateMetadata({ params }: EventGalleryPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', params.eventId)
    .single()
  
  return {
    title: event?.name ? `${event.name} Gallery | Cloud Burst` : 'Event Gallery | Cloud Burst',
    description: `View photos and videos from ${event?.name || 'this event'}`,
  }
}

export default async function EventGalleryPage({ params }: EventGalleryPageProps) {
  const { eventId } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Check if event exists
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      id, name, date, cover_image_url, logo_url, description,
      location, is_gallery_public, organizer_id, attendee_count, 
      status, tags
    `)
    .eq('id', eventId)
    .single()
  
  if (eventError || !event) {
    notFound()
  }
  
  // Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  // If gallery is not public and user is not authenticated, show auth check
  if (!event.is_gallery_public && !user) {
    return <GuestAuthCheck eventId={eventId} eventName={event.name} />
  }
  
  // Fetch gallery photos with pagination
  const { data: photos, error: photosError } = await supabase
    .from('gallery_photos')
    .select('id, url, thumbnail_url, width, height, caption, storage_path, uploaded_by, created_at, metadata, size')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (photosError) {
    console.error('Error fetching photos:', photosError)
  }
  
  // Format event date
  const eventDate = event.date ? formatDate(event.date) : 'Date to be determined'
  
  // Check if user can upload (organizer or authenticated guest)
  const canUpload = !!user
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Event Header */}
      <Card className="w-full overflow-hidden">
        {event.cover_image_url && (
          <div className="relative w-full h-48 md:h-64">
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            {event.logo_url && (
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                <Image
                  src={event.logo_url}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="h-10 w-auto object-contain"
                />
              </div>
            )}
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">{event.name}</CardTitle>
          <CardDescription>
            Photo Gallery
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium">Date</h4>
                <p className="text-sm text-muted-foreground">{eventDate}</p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}
            
            {event.attendee_count && (
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Attendees</h4>
                  <p className="text-sm text-muted-foreground">{event.attendee_count} guests</p>
                </div>
              </div>
            )}
          </div>
          
          {event.description && (
            <div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {event.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Gallery controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Photo Gallery</h2>
        
        {canUpload && (
          <UploadButton eventId={eventId} />
        )}
      </div>
      
      <Separator className="my-4" />
      
      {/* Gallery grid */}
      <GalleryGrid 
        photos={photos ? photos.map(photo => ({
          ...photo,
          event_id: eventId,
          filename: photo.storage_path ? photo.storage_path.split('/').pop() || '' : '',
          is_approved: true,
          updated_at: photo.created_at
        })) : []} 
        isLoading={false}
        emptyMessage="No photos have been uploaded yet."
        layout="masonry"
        defaultSort="newest"
      />
    </div>
  )
} 