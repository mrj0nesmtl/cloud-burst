import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GuestReservationForm } from '@/components/gallery/guest-reservation-form'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface GuestRegistrationPageProps {
  params: { 
    eventId: string 
  }
}

export async function generateMetadata({ params }: GuestRegistrationPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', params.eventId)
    .single()
  
  return {
    title: event?.name ? `Register for ${event.name} | Cloud Burst` : 'Event Registration | Cloud Burst',
    description: event?.name 
      ? `Register to access photos and videos from ${event.name}` 
      : 'Register to access event photos and videos',
  }
}

export default async function GuestRegistrationPage({ params }: GuestRegistrationPageProps) {
  const { eventId } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Get event details
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      id, name, date, location, description, 
      cover_image_url, logo_url, is_gallery_public
    `)
    .eq('id', eventId)
    .single()
  
  if (error || !event) {
    return notFound()
  }
  
  // If the gallery is public, registration is not needed
  if (event.is_gallery_public) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <Card className="overflow-hidden">
          <div className="relative w-full h-40">
            {event.cover_image_url ? (
              <Image
                src={event.cover_image_url}
                alt={event.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-primary/10 flex items-center justify-center">
                <h3 className="text-xl font-medium text-primary">{event.name}</h3>
              </div>
            )}
          </div>
          
          <CardContent className="pt-6 pb-8 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="text-muted-foreground">
                {event.date ? formatDate(event.date) : 'Date to be determined'}
              </p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-md">
              <p className="text-center">
                This gallery is public and no registration is required.
              </p>
            </div>
            
            <div className="flex justify-center">
              <a 
                href={`/events/${eventId}/gallery`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Gallery
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            <p className="text-muted-foreground">
              {event.date ? formatDate(event.date) : 'Date to be determined'}
            </p>
            
            {event.location && (
              <p className="text-muted-foreground mt-1">
                {event.location}
              </p>
            )}
          </div>
          
          {event.cover_image_url && (
            <div className="rounded-lg overflow-hidden mb-4">
              <Image
                src={event.cover_image_url}
                alt={event.name}
                width={500}
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {event.description && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">About this event</h3>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>
          )}
        </div>
        
        <div>
          <GuestReservationForm 
            eventId={eventId} 
            eventName={event.name} 
          />
        </div>
      </div>
    </div>
  )
} 