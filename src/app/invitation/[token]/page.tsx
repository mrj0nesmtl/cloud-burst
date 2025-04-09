import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { InvitationWithEvent } from '@/lib/invitations'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RsvpForm } from '@/components/rsvp/rsvp-form'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, User, Lock, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { validateInvitationToken } from '@/lib/invitations'
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
  
  // Validate the invitation token using our existing function
  const result = await validateInvitationToken(token)
  
  // Handle validation result with the correct properties
  if (!result.valid) {
    if (result.expired) {
      return redirect(`/invitation/expired?token=${token}`)
    } else if (result.error && result.error.includes('already been used')) {
      return redirect(`/invitation/used?token=${token}${result.invitation?.event.id ? `&eventId=${result.invitation.event.id}` : ''}`)
    } else {
      return notFound()
    }
  }
  
  // Extract event and invitation from the validated result
  const validatedInvitation = result.invitation
  
  if (!validatedInvitation || !validatedInvitation.event) {
    return notFound()
  }

  // Convert to the format needed by RsvpForm component
  const invitation: Invitation = {
    id: validatedInvitation.id,
    event_id: validatedInvitation.event.id,
    email: validatedInvitation.email || undefined,
    status: validatedInvitation.status,
    expires_at: validatedInvitation.expires_at
  }

  const event: Event = {
    id: validatedInvitation.event.id,
    name: validatedInvitation.event.name,
    description: validatedInvitation.event.description || undefined,
    location: validatedInvitation.event.location || undefined,
    // Converting date fields to the expected format
    start_date: validatedInvitation.event.date || undefined
  }

  // If we get here, we have a valid invitation
  return (
    <div className="container max-w-3xl py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">You're invited!</CardTitle>
          <CardDescription className="text-lg">
            {event.name}
          </CardDescription>
          {event.start_date && (
            <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{formatDate(event.start_date)}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {event.description && (
            <div className="mb-6 rounded-lg bg-secondary p-4 text-secondary-foreground">
              <p>{event.description}</p>
            </div>
          )}
          
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              By responding to this invitation, you'll create an account that lets you view event photos and upload your own.
            </AlertDescription>
          </Alert>
          
          <RsvpForm 
            invitation={invitation} 
            event={event} 
            token={token} 
          />
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Already responded? <Link href={`/events/${event.id}/gallery`} className="text-primary underline">View the gallery</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 