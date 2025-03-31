import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Mail, HelpCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Invitation Expired | Cloud Burst',
  description: 'This invitation has expired',
}

export default async function ExpiredPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token
  let eventName = 'this event'
  let contactEmail = 'contact@cloudburst.io'
  
  // If token is provided, try to get the event details
  if (token) {
    const cookieStore = cookies()
    const supabase = createServerClient({ cookies: () => cookieStore })
    
    // Get invitation details
    const { data: invitation } = await supabase
      .from('invitations')
      .select('event_id, email')
      .eq('token', token)
      .single()
    
    if (invitation) {
      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('name, organizer_id')
        .eq('id', invitation.event_id)
        .single()
      
      if (event) {
        eventName = event.name
        
        // Get organizer email
        const { data: organizer } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', event.organizer_id)
          .single()
        
        if (organizer?.email) {
          contactEmail = organizer.email
        }
      }
    }
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="overflow-hidden">
        <div className="bg-muted py-6">
          <div className="flex justify-center">
            <Clock className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">Invitation Expired</CardTitle>
          <p className="text-muted-foreground mt-2">
            The invitation to {eventName} has expired.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm">
              The RSVP deadline for this event has passed. If you believe this is an error
              or you still wish to attend, please contact the event organizer directly.
            </p>
            
            <div className="bg-muted rounded-lg p-4 flex items-center justify-center space-x-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">{contactEmail}</span>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href="/">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Return to Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-xs text-muted-foreground text-center">
            For more information, please contact the event organizer.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 