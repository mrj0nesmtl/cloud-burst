import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPublicEvents } from '@/lib/supabase/events'
import { formatDate } from '@/lib/utils'
import { CalendarDays, MapPin, Camera, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Public Events | Cloud Burst',
  description: 'Browse and explore public events on Cloud Burst',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PublicEventsPage() {
  // Fetch all public events
  const events = await getPublicEvents()
  
  return (
    <>
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 bg-gradient-to-b from-background to-background/80">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/10" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Discover Public Events
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse through our collection of public events and explore their photo galleries. Find inspiration or contribute your own photos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-500 hover:bg-blue-600" size="lg" asChild>
                <Link href="/auth/register">
                  Create Your Own Event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/marketing/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Events Grid */}
      <div className="container mx-auto py-16 px-4">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">No public events available</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              There are currently no public events to display. Check back later or create your own event!
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600" asChild>
              <Link href="/auth/register">
                Create Event
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold">All Public Events</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{events.length} events found</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300 border-border/60">
                  <div className="relative w-full h-48 overflow-hidden">
                    {event.cover_image_url ? (
                      <Image
                        src={event.cover_image_url}
                        alt={event.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-muted w-full h-full flex items-center justify-center">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {event.name}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-sm">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center text-sm mt-1">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2 flex-grow">
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
                      <Link href={`/events/${event.id}/gallery`}>
                        View Gallery
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
} 