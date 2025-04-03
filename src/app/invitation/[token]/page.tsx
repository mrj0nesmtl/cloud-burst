import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { Invitation, RSVP } from '@/types/rsvp'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RsvpForm } from './rsvp-form'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { validateInvitationToken, getEventForInvitation } from '@/lib/supabase/invitations'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface InvitationPageProps {
  params: {
    token: string
  }
}

export async function generateMetadata({ params }: InvitationPageProps): Promise<Metadata> {
  const cookieStore = cookies()
  const supabase = await createServerClient({ cookies: () => cookieStore })
  
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, events(name)')
    .eq('token', params.token)
    .single()
  
  if (!invitation) {
    return {
      title: 'Invitation Not Found',
      description: 'The requested invitation could not be found.',
    }
  }
  
  const eventName = invitation.events?.name || 'Event'
  
  return {
    title: `You're invited to ${eventName} | Cloud Burst`,
    description: `Respond to your invitation for ${eventName}`,
  }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = params
  
  if (!token) {
    return notFound()
  }
  
  // Validate the invitation token using our new helper function
  const invitation = await validateInvitationToken(token)
  
  if (!invitation) {
    // Redirect to expired page if token is invalid or expired
    return redirect(`/invitation/expired?token=${token}`)
  }
  
  // Set token in app.settings for RLS policies
  const cookieStore = cookies()
  const supabase = await createServerClient({ cookies: () => cookieStore })
  
  await (supabase as any).rpc('set_invitation_token', {
    token: token
  })
  
  // Get event details using our new helper function
  const event = await getEventForInvitation(invitation.event_id)
  
  if (!event) {
    console.error('Event not found for invitation')
    return notFound()
  }
  
  // Get event organizer
  const { data: organizer } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', event.organizer_id || '')
    .single()
  
  // Get RSVP data if exists
  const { data: rsvp } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitation.id)
    .maybeSingle()
  
  // Format event date
  const eventDate = event.date ? formatDate(event.date) : 'Date to be determined'
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="overflow-hidden">
        {event.cover_image_url && (
          <div className="relative w-full h-40 md:h-60">
            <Image
              src={event.cover_image_url}
              alt={event.name || ''}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl">{event.name}</CardTitle>
              <CardDescription>
                You've been invited by {organizer?.full_name || 'the event organizer'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {invitation.rsvp_status === 'accepted' 
                ? 'Accepted' 
                : invitation.rsvp_status === 'declined' 
                ? 'Declined' 
                : 'Awaiting Response'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
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
            </div>
            
            <div className="space-y-4">
              {invitation.name && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Invited Guest</h4>
                    <p className="text-sm text-muted-foreground">{invitation.name}</p>
                  </div>
                </div>
              )}
              
              {invitation.expires_at && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">RSVP Deadline</h4>
                    <p className="text-sm text-muted-foreground">
                      {invitation.expires_at ? formatDate(invitation.expires_at) : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Event Details</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xl font-semibold text-center mb-4">RSVP</h3>
            <RsvpForm 
              invitation={{
                id: invitation.id,
                event_id: invitation.event_id,
                email: invitation.email || '',
                name: invitation.name || '',
                token: token,
                status: invitation.status as any,
                rsvp_status: invitation.rsvp_status as any,
                expires_at: invitation.expires_at,
                metadata: {
                  notes: (invitation.metadata as any)?.notes,
                  dietary_preferences: (invitation.metadata as any)?.dietary_preferences,
                  plus_one_allowed: (invitation.metadata as any)?.plus_one_allowed || false,
                  plus_one_used: (invitation.metadata as any)?.plus_one_used || false,
                  magic_link: (invitation.metadata as any)?.magic_link
                },
                created_at: invitation.created_at,
                sent_at: invitation.sent_at || null,
                updated_at: invitation.updated_at || invitation.created_at,
                rsvp_date: invitation.rsvp_date as any
              }}
              token={token}
              rsvp={rsvp ? {
                id: rsvp.id,
                status: rsvp.status,
                guest_count: rsvp.guest_count,
                dietary_restrictions: rsvp.dietary_restrictions || undefined,
                notes: rsvp.notes || undefined
              } : null}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
          
          {(invitation.metadata as any)?.magic_link && (
            <Button variant="outline" asChild>
              <Link href={(invitation.metadata as any)?.magic_link}>
                Sign in to your account
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 