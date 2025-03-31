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
  const supabase = createServerClient({ cookies: () => cookieStore })
  
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
  const eventDate = event.date ? formatDate(new Date(event.date)) : 'Date to be determined'
  
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="overflow-hidden">
        {event.cover_image_url && (
          <div className="relative w-full h-40">
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              className="object-cover opacity-50"
              priority
            />
          </div>
        )}
        
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">Response Received</CardTitle>
          <p className="text-muted-foreground mt-2">
            We're sorry you can't make it to {event.name}.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4">
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
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We've recorded your response. If your plans change, you can always update your RSVP.
            </p>
            
            <Button variant="outline" asChild>
              <Link href={`/invitation/${token}`}>
                <Edit className="h-4 w-4 mr-2" />
                Update My Response
              </Link>
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-xs text-muted-foreground text-center">
            A confirmation email has been sent to {invitation.email}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 