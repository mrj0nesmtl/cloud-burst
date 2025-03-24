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