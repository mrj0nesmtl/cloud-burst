'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export type InvitationWithEvent = {
  id: string
  token: string
  email: string
  status: string
  event: {
    id: string
    name: string
    date: string | null
    location: string | null
    description: string | null
    cover_image_url: string | null
    logo_url: string | null
  }
  expires_at: string | null
  created_at: string
}

/**
 * Client-side version of validateInvitationToken
 * For use in Client Components
 */
export async function validateInvitationTokenClient(token: string): Promise<{
  valid: boolean
  invitation?: InvitationWithEvent
  expired?: boolean
  error?: string
}> {
  try {
    const supabase = createClientComponentClient<Database>()
    
    // Fetch invitation with its associated event
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select(`
        id, token, email, status, expires_at, created_at,
        event:event_id (
          id, name, date, location, description, cover_image_url, logo_url
        )
      `)
      .eq('token', token)
      .single()
      
    if (error) {
      console.error('Error fetching invitation:', error)
      return { valid: false, error: 'Invalid invitation token' }
    }
    
    if (!invitation) {
      return { valid: false, error: 'Invitation not found' }
    }
    
    // Check if invitation is expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { valid: false, expired: true, invitation: invitation as InvitationWithEvent }
    }
    
    // Check if invitation has been used
    if (invitation.status === 'used') {
      return { valid: false, error: 'Invitation has already been used', invitation: invitation as InvitationWithEvent }
    }
    
    return { valid: true, invitation: invitation as InvitationWithEvent }
  } catch (error) {
    console.error('Error validating invitation token:', error)
    return { valid: false, error: 'An error occurred while validating the invitation' }
  }
}

/**
 * Client-side version of getRsvpStatus
 * For use in Client Components
 */
export async function getRsvpStatusClient(invitationId: string) {
  try {
    const supabase = createClientComponentClient<Database>()
    
    // Check if there's an existing RSVP for this invitation
    const { data: rsvp, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitationId)
      .single()
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching RSVP:', error)
      return { error: 'Failed to fetch RSVP status' }
    }
    
    return { rsvp }
  } catch (error) {
    console.error('Error getting RSVP status:', error)
    return { error: 'An error occurred while getting RSVP status' }
  }
} 