import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { InvitationWithEvent } from '@/lib/invitations'

// Add additional debugging output
console.log('📣 Loading invitation/[token]/page.tsx - this is the main page component')

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RsvpForm } from '@/components/rsvp/rsvp-form'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, User, Lock, AlertTriangle, CameraOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { validateInvitationToken } from '@/lib/supabase/invitations'
import { getEventForInvitation } from '@/lib/supabase/invitations'
import { MagicLinkAuth } from '@/components/invitations/magic-link-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface InvitationPageProps {
  params: {
    token: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: { token: string }
}): Promise<Metadata> {
  console.log('Generating metadata for invitation token:', params.token)
  try {
    const invitation = await validateInvitationToken(params.token)
    if (!invitation) {
      return {
        title: 'Invitation | Cloud Burst',
      }
    }
    
    // Fetch event details separately
    const event = await getEventForInvitation(invitation.event_id)
    if (!event) {
      return {
        title: 'Invitation | Cloud Burst',
      }
    }
    
    return {
      title: `${event.name} | Cloud Burst`,
      description: `You're invited to ${event.name}. Please RSVP.`,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Invitation | Cloud Burst',
    }
  }
}

// Use the exact types from the RsvpForm component
type Event = {
  id: string
  name: string
  host_name?: string
  description?: string
  start_date?: string
  end_date?: string
  location?: string
}

type Invitation = {
  id: string
  email?: string
  event_id: string
  status: string
  expires_at?: string | null
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = params
  
  // Enhanced debug logging
  console.log('🔍 Handling invitation page request:', { 
    token,
    tokenLength: token.length,
    hasHyphens: token.includes('-'),
    tokenFormat: token.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i) ? 'Valid UUID' : 'Not UUID format'
  })
  
  try {
    // Log token before validation for debugging
    console.log('🔑 About to validate token in database:', token);
    
    // Validate the invitation token using our existing function
    const invitation = await validateInvitationToken(token)
    
    // If no invitation found, return 404
    if (!invitation) {
      console.error('❌ Invitation validation failed for token:', token)
      // Add a fallback component with a link to guest-access instead of notFound()
      return (
        <div className="container max-w-3xl py-10">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Invitation Not Found</CardTitle>
              <CardDescription className="text-lg">
                We couldn't validate your invitation token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Token Error</AlertTitle>
                <AlertDescription>
                  The invitation token could not be validated. This may be due to a server issue.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col items-center gap-4">
                <p className="text-center text-muted-foreground">
                  Please try the alternative access method or contact the event organizer.
                </p>
                <Link href="/guest-access" passHref>
                  <Button>
                    Use Alternative Access
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    console.log('✅ Successfully validated invitation:', { 
      id: invitation.id, 
      event_id: invitation.event_id,
      status: invitation.status
    })
    
    // Get event details
    const event = await getEventForInvitation(invitation.event_id)
    
    if (!event) {
      console.error('Event not found for invitation:', invitation.id)
      return notFound()
    }
    
    console.log('Retrieved event for invitation:', { 
      id: event.id, 
      name: event.name 
    })
    
    // Convert to the format needed by RsvpForm component
    const rsvpInvitation = {
      id: invitation.id,
      event_id: invitation.event_id,
      email: invitation.email || undefined,
      status: invitation.status,
      expires_at: invitation.expires_at
    }

    const rsvpEvent = {
      id: event.id,
      name: event.name,
      description: event.description || undefined,
      location: event.location || undefined,
      // Converting date fields to the expected format
      start_date: event.date || undefined
    }
    
    // If we get here, we have a valid invitation and event
    return (
      <div className="container max-w-3xl py-10">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">You're invited!</CardTitle>
            <CardDescription className="text-lg">
              {rsvpEvent.name}
            </CardDescription>
            {rsvpEvent.start_date && (
              <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{formatDate(rsvpEvent.start_date)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {rsvpEvent.description && (
              <div className="mb-6 rounded-lg bg-secondary p-4 text-secondary-foreground">
                <p>{rsvpEvent.description}</p>
              </div>
            )}
            
            {/* Gallery Preview Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-center mb-3">Event Gallery Preview</h3>
              {event.cover_image_url ? (
                <div className="rounded-md overflow-hidden relative aspect-video">
                  <Image 
                    src={event.cover_image_url} 
                    alt={rsvpEvent.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="rounded-md overflow-hidden relative aspect-video bg-muted flex items-center justify-center">
                  <CameraOff className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                By responding to this invitation, you'll create an account that lets you view event photos and upload your own.
              </AlertDescription>
            </Alert>
            
            <RsvpForm 
              invitation={rsvpInvitation} 
              event={rsvpEvent} 
              token={token} 
            />
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>
                Already responded? <Link href={`/events/${rsvpEvent.id}/gallery`} className="text-primary underline">View the gallery</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error handling invitation page:', error)
    return notFound()
  }
} 