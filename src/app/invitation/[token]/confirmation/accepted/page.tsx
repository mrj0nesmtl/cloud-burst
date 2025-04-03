import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, CalendarDays, Camera, Share2, CalendarPlus } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AddToCalendarButton } from './add-to-calendar-button'
import { ShareEventButton } from './share-event-button'

export const metadata: Metadata = {
  title: 'RSVP Confirmed | Cloud Burst',
  description: 'Your RSVP has been confirmed',
}

export default async function AcceptedPage({ params }: { params: { token: string } }) {
  const { token } = params
  
  if (!token) {
    return notFound()
  }
  
  // Get invitation and event details
  const cookieStore = cookies()
  const supabase = await createServerClient({ cookies: () => cookieStore })
  
  // Get invitation details
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('id, event_id, email, name, status, rsvp_status, rsvp_date, metadata')
    .eq('token', token)
    .single()
  
  if (error || !invitation || invitation.rsvp_status !== 'accepted') {
    return notFound()
  }
  
  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('id, name, date, location, cover_image_url, description')
    .eq('id', invitation.event_id)
    .single()
  
  if (!event) {
    return notFound()
  }
  
  // Format event date
  const eventDate = event.date ? formatDate(event.date.toString()) : 'Date to be determined'
  
  // Create calendar event data for add-to-calendar feature
  const calendarEvent = {
    name: event.name,
    details: event.description || '',
    location: event.location || '',
    startsAt: event.date || new Date().toISOString(),
    endsAt: event.date ? new Date(new Date(event.date.toString()).getTime() + 3600000).toISOString() : new Date(new Date().getTime() + 3600000).toISOString(),
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden border-green-200 dark:border-green-900">
        {event.cover_image_url && (
          <div className="relative w-full h-48 md:h-60">
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h1 className="text-xl font-bold">{event.name}</h1>
              <p className="text-sm opacity-90">{eventDate}</p>
            </div>
          </div>
        )}
        
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 animate-in zoom-in-50 duration-300 delay-200">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl animate-in fade-in-50 duration-300 delay-300">You're all set!</CardTitle>
          <p className="text-muted-foreground mt-2 animate-in fade-in-50 duration-300 delay-400">
            Your RSVP for {event.name} has been confirmed.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 animate-in fade-in-50 duration-300 delay-500">
            <div className="flex items-center space-x-2 mb-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Event Details</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li><strong>Event:</strong> {event.name}</li>
              <li><strong>Date:</strong> {eventDate}</li>
              {event.location && <li><strong>Location:</strong> {event.location}</li>}
              {invitation.name && <li><strong>Attending:</strong> {invitation.name}</li>}
              {(invitation.metadata as any)?.plus_one_used && 
                <li><strong>Plus One:</strong> {(invitation.metadata as any).plus_one_name || 'Guest'}</li>}
            </ul>
          </div>
          
          <Separator className="animate-in fade-in-50 duration-300 delay-600" />
          
          <div className="text-center space-y-4 animate-in fade-in-50 duration-300 delay-700">
            <h3 className="font-medium">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Add this event to your calendar and share it with friends.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 justify-center">
              <AddToCalendarButton event={calendarEvent} />
              
              <ShareEventButton 
                event={{
                  name: event.name,
                  date: eventDate,
                  location: event.location || '',
                  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invitation/${token}`
                }} 
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 border-t pt-6 animate-in fade-in-50 duration-300 delay-800">
          <p className="text-xs text-muted-foreground text-center">
            A confirmation email has been sent to {invitation.email}
          </p>
          
          <Button variant="outline" asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 