import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Shell } from '@/components/shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Event Invitation',
  description: 'View and accept your event invitation',
}

interface InvitationPageProps {
  params: {
    token: string
  }
}

async function getInvitationDetails(token: string) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get invitation with event details
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      *,
      event:events (
        id,
        name,
        date,
        location,
        description,
        organizer:profiles!organizer_id (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('token', token)
    .single()
  
  if (error || !invitation) {
    console.error('Error fetching invitation:', error)
    return null
  }
  
  return invitation
}

async function acceptInvitation(token: string) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/auth/signin')
  }
  
  // Get invitation
  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()
  
  if (invitationError || !invitation) {
    throw new Error('Invalid invitation')
  }
  
  // Create event attendee record
  const { error: attendeeError } = await supabase
    .from('event_attendees')
    .insert({
      event_id: invitation.event_id,
      user_id: session.user.id,
      invitation_id: invitation.id,
      name: invitation.name || session.user.email,
      email: invitation.email || session.user.email,
      status: 'confirmed'
    })
  
  if (attendeeError) {
    throw new Error('Failed to create attendee record')
  }
  
  // Update invitation status
  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      status: 'used',
      updated_at: new Date().toISOString()
    })
    .eq('id', invitation.id)
  
  if (updateError) {
    throw new Error('Failed to update invitation')
  }
  
  return invitation
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const invitation = await getInvitationDetails(params.token)
  
  if (!invitation) {
    notFound()
  }
  
  // Handle form submission
  const formData = await (async () => {
    'use server'
    try {
      const accepted = await acceptInvitation(params.token)
      return { success: true, invitation: accepted }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })()
  
  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle>{invitation.event.name}</CardTitle>
          <CardDescription>
            {formatDate(invitation.event.date)}
            {invitation.event.location && ` at ${invitation.event.location}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert">
            <p>
              You've been invited to {invitation.event.name} by{' '}
              {invitation.event.organizer.full_name}!
            </p>
            {invitation.event.description && (
              <p>{invitation.event.description}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {invitation.status === 'used' ? (
            <>
              <p className="text-sm text-muted-foreground">
                You've already accepted this invitation.
              </p>
              <div className="flex gap-2">
                <Link href={`/gallery/${invitation.event_id}`} passHref>
                  <Button variant="secondary">View Gallery</Button>
                </Link>
                <Link href={`/invite/${invitation.token}/upload`} passHref>
                  <Button>Upload Photos</Button>
                </Link>
              </div>
            </>
          ) : (
            <form action={formData}>
              <Button type="submit">Accept Invitation</Button>
            </form>
          )}
        </CardFooter>
      </Card>
    </Shell>
  )
} 