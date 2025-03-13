import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { getUserGalleries, createGalleryForEvent } from '@/lib/supabase/galleries'
import { formatDate } from '@/lib/utils'
import { Calendar, ImageIcon, Camera, Settings, ExternalLink } from 'lucide-react'
import { Gallery } from '@/types/gallery'

export const metadata: Metadata = {
  title: 'Event Galleries | Gallery | Cloud Burst',
  description: 'Manage galleries for all your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function EventGalleriesPage() {
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
      .select('id, name, date, cover_image_url, status')
      .eq('organizer_id', session.user.id)
    
    if (eventsError) throw eventsError
    
    if (!events || events.length === 0) {
      return (
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Event Galleries
            </CardTitle>
            <CardDescription>
              No events found to display galleries
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Events Found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                You don't have any events yet. Create an event to get started.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/protected/events/create">
                  Create New Event
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Try to get galleries, but handle failure more gracefully
    let galleries: Gallery[] = []
    try {
      galleries = await getUserGalleries()
    } catch (error) {
      console.error('Error fetching galleries, will create missing ones:', error)
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
          gallery = await createGalleryForEvent(event.id)
        } catch (error) {
          console.error(`Error creating gallery for event ${event.id}:`, error)
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
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Event Galleries
          </CardTitle>
          <CardDescription>
            {galleryData.length > 0
              ? `Manage galleries for ${galleryData.length} events`
              : 'No event galleries found'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {galleryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Event Galleries</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                You don't have any events with galleries yet. Create an event to get started.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/protected/events/create">
                  Create New Event
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {galleryData.map(({ gallery, event, photoCount }) => (
                <div key={gallery.id} className="relative group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                  <div className="relative h-40 w-full bg-muted">
                    {event?.cover_image_url ? (
                      <Image
                        src={event.cover_image_url}
                        alt={event?.name || 'Event gallery'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="text-white">
                        <h3 className="font-medium">{event?.name || 'Unnamed Event'}</h3>
                        <p className="text-xs text-white/80">
                          {event?.date ? formatDate(event.date) : 'No date'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Camera className="mr-1 h-4 w-4" />
                        {photoCount} Photos
                      </div>
                      <div className="flex items-center">
                        <Settings className="mr-1 h-4 w-4" />
                        {gallery.settings?.layout || 'Grid'} Layout
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event?.id}/gallery`}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/protected/gallery/events/${gallery.id}`}>
                          <Settings className="mr-1 h-3 w-3" />
                          Settings
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error loading event galleries:', error)
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Galleries</h1>
        <p className="text-muted-foreground">
          There was an error loading your event galleries. Please try again later.
        </p>
        <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-[200px]">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }
} 