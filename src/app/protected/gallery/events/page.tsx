import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ImageIcon, Camera, Settings, ExternalLink } from 'lucide-react'
import { Gallery } from '@/types/gallery'
// Import the server-side gallery functions
import { getUserGalleriesServer, createGalleryForEventServer } from '@/lib/supabase/galleries.server'
import { formatDate } from '@/lib/utils'

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
      .select('id, name, date, cover_image_url, status')
      .eq('organizer_id', session.user.id)
    
    if (eventsError) throw eventsError
    
    if (!events || events.length === 0) {
      return (
        <div className="w-full max-w-7xl mx-auto">
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Calendar className="mr-3 h-6 w-6 text-primary" />
                Event Galleries
              </CardTitle>
              <CardDescription className="text-base">
                No events found to display galleries
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/30 p-5 rounded-full mb-6">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Events Found</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  You don't have any events yet. Create an event to get started with your gallery.
                </p>
                <Button size="lg" asChild>
                  <Link href="/protected/events/create">
                    Create New Event
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
          // Use the server-side function instead
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
      <div className="w-full max-w-7xl mx-auto">
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
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted/30 p-5 rounded-full mb-6">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Event Galleries</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  You don't have any events with galleries yet. Create an event to get started.
                </p>
                <Button size="lg" asChild>
                  <Link href="/protected/events/create">
                    Create New Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div 
                className="grid gap-6"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  margin: "0 auto"
                }}
              >
                {galleryData.map(({ gallery, event, photoCount }) => (
                  <div 
                    key={gallery.id} 
                    className="group"
                    style={{
                      minWidth: "320px",
                      transition: "all 0.2s ease-in-out",
                      height: "100%"
                    }}
                  >
                    <div 
                      className="relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md flex flex-col h-full"
                      style={{
                        transform: "translateY(0)",
                        transition: "all 0.2s ease-in-out"
                      }}
                    >
                      {/* Image Container with 4:3 Aspect Ratio */}
                      <div className="relative bg-muted w-full" style={{ paddingTop: "75%" }}>
                        {event?.cover_image_url ? (
                          <Image
                            src={event.cover_image_url}
                            alt={event?.name || 'Event gallery'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                        )}
                        
                        {/* Top-right date badge */}
                        {event?.date && (
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                            {formatDate(event.date)}
                          </div>
                        )}
                        
                        {/* Bottom gradient and title */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-medium text-lg text-white mb-1 line-clamp-1">
                              {event?.name || 'Unnamed Event'}
                            </h3>
                            <div className="flex items-center">
                              <div className="bg-black/40 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-full flex items-center">
                                <Camera className="h-3 w-3 mr-1" />
                                {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Settings className="mr-2 h-4 w-4" />
                              {gallery.settings?.layout || 'Grid'} Layout
                            </div>
                            <div className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                              {event?.status || 'Draft'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                          <Button className="flex-1" variant="default" size="sm" asChild>
                            <Link href={`/events/${event?.id}/gallery`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Gallery
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/protected/gallery/events/${gallery.id}`}>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
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
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
          <h1 className="text-xl font-bold text-destructive mb-3">Error Loading Galleries</h1>
          <p className="text-muted-foreground mb-4">
            There was an error loading your event galleries. Please try again later.
          </p>
          <pre className="mt-4 p-4 bg-muted/50 rounded-md text-xs overflow-auto max-h-[200px]">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
} 