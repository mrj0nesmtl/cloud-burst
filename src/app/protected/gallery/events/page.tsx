import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, ImageIcon } from 'lucide-react'
import { Gallery } from '@/types/gallery'
// Import the server-side gallery functions
import { getUserGalleriesServer, createGalleryForEventServer } from '@/lib/supabase/galleries.server'
import { GalleryEventCard } from '@/components/gallery/gallery-event-card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata: Metadata = {
  title: 'Event Galleries | Gallery | Cloud Burst',
  description: 'Manage galleries for all your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function EventGalleriesPage() {
  console.log('🔍 EventGalleriesPage: Page component starting');
  
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/gallery/events')

    // Get all user's events first
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, date, cover_image_url, logo_url, status, organizer_id')
      .eq('organizer_id', session.user.id)
    
    if (eventsError) {
      console.error('🔍 EventGalleriesPage: Error fetching events:', eventsError)
      throw eventsError
    }
    
    if (!events || events.length === 0) {
      return (
        <div className="w-full max-w-7xl mx-auto p-6">
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title="No Events Found"
            description="You don't have any events yet. Create an event to get started with your gallery."
            action={
              <Button size="lg" asChild>
                <Link href="/protected/events/create">
                  Create New Event
                </Link>
              </Button>
            }
          />
        </div>
      )
    }

    // Try to get galleries, but handle failure more gracefully
    let galleries: Gallery[] = []
    try {
      console.log('🔍 EventGalleriesPage: Attempting to get user galleries');
      // Use the server-side function instead
      galleries = await getUserGalleriesServer()
      console.log('🔍 EventGalleriesPage: Galleries received:', galleries?.length || 0);
    } catch (error) {
      console.error('🔍 EventGalleriesPage: Error fetching galleries, will create missing ones:', error)
      // We'll handle this by continuing execution and creating galleries as needed
    }

    // Create a map of existing galleries by event ID for quick lookup
    const galleryMap = new Map()
    galleries.forEach(gallery => {
      galleryMap.set(gallery.event_id, gallery)
    })

    // For each event, ensure it has a gallery or create one
    const galleryDataPromises = events.map(async (event) => {
      let gallery = galleryMap.get(event.id)
      
      // If no gallery exists for this event, create one
      if (!gallery) {
        try {
          console.log('🔍 EventGalleriesPage: Creating gallery for event:', event.id);
          gallery = await createGalleryForEventServer(event.id)
        } catch (error) {
          console.error('🔍 EventGalleriesPage: Error creating gallery for event', event.id, error)
          // Return null for events where gallery creation failed
          return null
        }
      }
      
      // Get photo count for this gallery
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('is_approved', true)
      
      return {
        gallery,
        event,
        photoCount: count || 0
      }
    })
    
    // Wait for all gallery data to be processed
    const galleryDataResults = await Promise.all(galleryDataPromises)
    
    // Filter out null results (failed gallery creations)
    const galleryData = galleryDataResults.filter(result => result !== null)
    
    // Sort galleries by event date (newest first)
    galleryData.sort((a, b) => {
      if (!a.event?.date || !b.event?.date) return 0
      return new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
    })

    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-2xl">
              <Calendar className="mr-3 h-6 w-6 text-primary" />
              Event Galleries
            </CardTitle>
            <CardDescription className="text-base">
              {galleryData.length > 0
                ? `Manage galleries for ${galleryData.length} ${galleryData.length === 1 ? 'event' : 'events'}`
                : 'No event galleries found'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {galleryData.length === 0 ? (
              <EmptyState
                icon={<ImageIcon className="h-12 w-12" />}
                title="No Event Galleries"
                description="You don't have any events with galleries yet. Create an event to get started."
                action={
                  <Button size="lg" asChild>
                    <Link href="/protected/events/create">
                      Create New Event
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {galleryData.map(({ gallery, event, photoCount }) => (
                  <div key={gallery.id} className="w-full h-full">
                    <GalleryEventCard
                      id={gallery.id}
                      eventId={event.id}
                      name={event.name || "Unnamed Event"}
                      date={event.date}
                      thumbnailUrl={event.cover_image_url}
                      logoUrl={event.logo_url}
                      photoCount={photoCount || 0}
                      status={event.status || "draft"}
                      settings={gallery.settings || { layout: 'grid' }}
                      organizerId={event.organizer_id}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('🔍 EventGalleriesPage: Error in page component:', error)
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h1 className="text-xl font-bold text-destructive mb-3">Error Loading Galleries</h1>
          <p className="text-muted-foreground mb-4">
            There was an error loading your event galleries. Please try again later.
          </p>
          <Button asChild className="mb-4">
            <Link href="/protected/dashboard">
              Return to Dashboard
            </Link>
          </Button>
          <pre className="mt-4 p-4 bg-muted/50 rounded-md text-xs overflow-auto max-h-[200px]">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
} 