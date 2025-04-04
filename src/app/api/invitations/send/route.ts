import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const sendInvitationSchema = z.object({
  invitationIds: z.array(z.string().uuid()).min(1),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse and validate the request body
    const body = await request.json()
    const result = sendInvitationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { invitationIds } = result.data
    
    // Get invitations with event details
    const { data: invitations, error: fetchError } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        name,
        message,
        token,
        plus_one,
        event_id,
        events(
          id,
          name,
          description,
          date,
          location,
          organizer_id,
          profiles(full_name, email)
        )
      `)
      .in('id', invitationIds)
    
    if (fetchError) {
      console.error('Error fetching invitations:', fetchError)
      return NextResponse.json(
        { error: 'Error fetching invitations' },
        { status: 500 }
      )
    }
    
    if (!invitations || invitations.length === 0) {
      return NextResponse.json(
        { error: 'No invitations found' },
        { status: 404 }
      )
    }
    
    // Verify user has permission to send these invitations
    for (const invitation of invitations) {
      const event = invitation.events as any  // Cast to any to resolve TS errors
      if (event?.organizer_id !== session.user.id) {
        // Check if user is allowed to send invitations for this event
        // This could be extended to check for collaborators, etc.
        return NextResponse.json(
          { error: 'Unauthorized to send invitations for this event' },
          { status: 403 }
        )
      }
    }
    
    // For each invitation, send an email
    const sendResults = await Promise.all(
      invitations.map(async (invitation) => {
        // Create the invitation URL
        const invitationUrl = `${request.nextUrl.origin}/invitation/${invitation.token}`
        
        // Get event details
        const event = invitation.events as any  // Cast to any to resolve TS errors
        const organizer = event?.profiles?.[0] || { full_name: 'Event Organizer' }
        
        try {
          // Send email via API route
          const emailResult = await fetch(`${request.nextUrl.origin}/api/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: invitation.email,
              subject: `You're Invited: ${event?.name || 'Event'}`,
              templateName: 'invitation',
              templateData: {
                invitationUrl,
                eventName: event?.name || 'Event',
                eventDate: new Date(event?.date || Date.now()).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
                eventLocation: event?.location || 'TBD',
                eventDescription: event?.description || '',
                guestName: invitation.name || invitation.email.split('@')[0],
                organizerName: organizer?.full_name || 'Event Organizer',
                plusOne: invitation.plus_one,
                personalMessage: invitation.message,
              },
            }),
          })
          
          if (!emailResult.ok) {
            throw new Error('Failed to send email')
          }
          
          // Update invitation status to 'sent'
          await supabase
            .from('invitations')
            .update({
              status: 'sent',
              updated_at: new Date().toISOString(),
            })
            .eq('id', invitation.id)
          
          // Track analytics for invitation sent
          await supabase
            .from('analytics_events')
            .insert({
              type: 'invitation_sent',
              user_id: session.user.id,
              invitation_id: invitation.id,
              properties: {
                event_id: event?.id || invitation.event_id,
                email: invitation.email,
                timestamp: new Date().toISOString(),
              },
            })
          
          return {
            id: invitation.id,
            email: invitation.email,
            success: true,
          }
        } catch (error) {
          console.error(`Error sending invitation to ${invitation.email}:`, error)
          return {
            id: invitation.id,
            email: invitation.email,
            success: false,
            error: (error as Error).message,
          }
        }
      })
    )
    
    // Count successes and failures
    const successCount = sendResults.filter(result => result.success).length
    const failureCount = sendResults.filter(result => !result.success).length
    
    return NextResponse.json({
      success: true,
      total: invitations.length,
      sent: successCount,
      failed: failureCount,
      results: sendResults,
    })
  } catch (error) {
    console.error('Error sending invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 