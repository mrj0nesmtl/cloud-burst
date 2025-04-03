import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { XCircle, CalendarDays, Edit } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'RSVP Declined | Cloud Burst',
  description: 'Your response has been recorded',
}

export default async function DeclinedPage({ params }: { params: { token: string } }) {
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
  
  if (error || !invitation || invitation.rsvp_status !== 'declined') {
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
  
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden border-red-200 dark:border-red-900">
        {event.cover_image_url && (
          <div className="relative w-full h-48 md:h-60">
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover grayscale opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h1 className="text-xl font-bold">{event.name}</h1>
              <p className="text-sm opacity-90">{eventDate}</p>
            </div>
          </div>
        )}
        
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 animate-in zoom-in-50 duration-300 delay-200">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl animate-in fade-in-50 duration-300 delay-300">Response Received</CardTitle>
          <p className="text-muted-foreground mt-2 animate-in fade-in-50 duration-300 delay-400">
            We're sorry you can't make it to {event.name}.
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
              {invitation.name && <li><strong>Invited:</strong> {invitation.name}</li>}
            </ul>
          </div>
          
          <Separator className="animate-in fade-in-50 duration-300 delay-600" />
          
          <div className="text-center space-y-4 animate-in fade-in-50 duration-300 delay-700">
            <h3 className="font-medium">Changed Your Mind?</h3>
            <p className="text-sm text-muted-foreground">
              We've recorded your response. If your plans change, you can always update your RSVP.
            </p>
            
            <Button variant="outline" asChild className="animate-pulse">
              <Link href={`/invitation/${token}`}>
                <Edit className="h-4 w-4 mr-2" />
                Update My Response
              </Link>
            </Button>
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