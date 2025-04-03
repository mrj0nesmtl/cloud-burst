import { createServerClient } from './server'
import { cookies } from 'next/headers'
import { Invitation } from '@/types/invitations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Get all invitations for an event
 * @param eventId The event ID
 * @returns Array of invitation objects
 */
export async function getInvitationsByEventId(eventId: string): Promise<Invitation[]> {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching invitations:', error)
    throw error
  }
  
  return data as Invitation[]
}

/**
 * Validate an invitation token and get the associated invitation data
 * @param token The invitation token to validate
 * @returns The invitation data if valid, null if invalid or expired
 */
export async function validateInvitationToken(token: string) {
  const cookieStore = cookies()
  const supabase = await createServerClient({ cookies: () => cookieStore })
  
  // Get invitation details
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('id, event_id, email, name, status, rsvp_status, expires_at, metadata, created_at, sent_at, updated_at, rsvp_date')
    .eq('token', token)
    .single()
  
  if (error || !invitation) {
    console.error('Invitation not found:', error)
    return null
  }
  
  // Check if invitation has expired
  const now = new Date()
  const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
  
  if (invitation.status === 'expired' || (expiresAt && now > expiresAt)) {
    // Update status to expired if it's not already
    if (invitation.status !== 'expired') {
      await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)
    }
    return null
  }
  
  // Mark invitation as opened if not already opened or responded to
  if (invitation.status === 'sent') {
    await supabase
      .from('invitations')
      .update({ status: 'opened' })
      .eq('id', invitation.id)
  }
  
  return invitation
}

/**
 * Get event details for an invitation
 * @param eventId The event ID
 * @returns The event details
 */
export async function getEventForInvitation(eventId: string) {
  const cookieStore = cookies()
  const supabase = await createServerClient({ cookies: () => cookieStore })
  
  const { data: event, error } = await supabase
    .from('events')
    .select('id, name, date, location, description, cover_image_url, organizer_id')
    .eq('id', eventId)
    .single()
  
  if (error || !event) {
    console.error('Event not found:', error)
    return null
  }
  
  return event
} 