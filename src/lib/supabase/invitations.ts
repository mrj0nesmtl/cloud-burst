import { createServerClient } from './server'
import { cookies } from 'next/headers'
import { Invitation } from '@/types/invitations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

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
  // Enhanced logging for debugging
  console.log('🔍 Validating invitation token:', { 
    token, 
    tokenLength: token.length,
    hasHyphens: token.includes('-'),
    format: 'UUID format expected (8-4-4-4-12 characters with hyphens)',
    isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
  })
  
  try {
    // Use createServerComponentClient directly with cookies
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Additional logging for the query
    console.log('📊 DB Query:', {
      table: 'invitations',
      condition: `token = ${token}`,
      tokenEncoded: encodeURIComponent(token)
    })
    
    // Get invitation details
    console.log('Querying database for token:', token)
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('id, event_id, email, name, status, rsvp_status, expires_at, metadata, created_at, sent_at, updated_at, rsvp_date')
      .eq('token', token)
      .single()
    
    if (error || !invitation) {
      console.error('Invitation not found:', error)
      return null
    }
    
    console.log('Successfully retrieved invitation:', {
      id: invitation.id,
      status: invitation.status,
      expires_at: invitation.expires_at,
      event_id: invitation.event_id
    })
    
    // Get event details to check if it's past the event date
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, date, location, description, cover_image_url, organizer_id')
      .eq('id', invitation.event_id)
      .single()
    
    if (eventError) {
      console.error('Error fetching event:', eventError)
      // Continue anyway, as we can still return invitation data
    }
    
    console.log('Event date:', event?.date)
    
    // Check if invitation has expired
    const now = new Date()
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
    const eventDate = event?.date ? new Date(event.date) : null
    
    console.log('Time check:', {
      now: now.toISOString(),
      expiresAt: expiresAt?.toISOString() || 'not set',
      eventDate: eventDate?.toISOString() || 'not set'
    })

    // An invitation is expired if:
    // 1. It has status 'expired'
    // 2. It has an explicit expiration date that has passed
    // 3. The event date has passed (only if we have an event date)
    let statusCheck = invitation.status === 'expired'
    let expiresAtCheck = false
    let eventDateCheck = false
    
    // Only check dates if they exist
    if (expiresAt) {
      expiresAtCheck = now > expiresAt
    }
    
    if (eventDate) {
      eventDateCheck = now > eventDate
    }
    
    const isExpired = statusCheck || expiresAtCheck || eventDateCheck
    
    console.log('Detailed invitation expiration check:', {
      isExpired,
      statusCheck,
      expiresAtCheck,
      expiresAtDate: expiresAt?.toISOString() || null,
      eventDateCheck,
      eventDate: eventDate?.toISOString() || null
    })
    
    if (isExpired) {
      // Update status to expired if it's not already
      if (invitation.status !== 'expired') {
        await supabase
          .from('invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id)
        
        console.log('Updated invitation status to expired')
      }
      return null
    }
    
    // Mark invitation as opened if not already opened or responded to
    if (invitation.status === 'sent') {
      await supabase
        .from('invitations')
        .update({ status: 'opened' })
        .eq('id', invitation.id)
      
      console.log('Updated invitation status to opened')
    }
    
    return invitation
  } catch (error) {
    console.error('Error validating invitation token:', error)
    return null
  }
}

/**
 * Get event details for an invitation
 * @param eventId The event ID
 * @returns The event details
 */
export async function getEventForInvitation(eventId: string) {
  if (!eventId) {
    console.error('No event ID provided to getEventForInvitation')
    return null
  }

  try {
    // Use createServerComponentClient directly with cookies
    const supabase = createServerComponentClient<Database>({ cookies })
    
    console.log('Fetching event for invitation:', eventId)
    
    const { data: event, error } = await supabase
      .from('events')
      .select('id, name, date, location, description, cover_image_url, organizer_id')
      .eq('id', eventId)
      .single()
    
    if (error || !event) {
      console.error('Event not found:', error)
      return null
    }
    
    console.log('Retrieved event:', { 
      id: event.id,
      name: event.name,
      date: event.date
    })
    
    return event
  } catch (error) {
    console.error('Error fetching event for invitation:', error)
    return null
  }
} 