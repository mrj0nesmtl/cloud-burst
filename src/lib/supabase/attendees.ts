import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Type definition for an attendee
export interface Attendee {
  id: string;
  event_id: string;
  invitation_id: string;
  invitation_token: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status: 'invited' | 'confirmed' | 'declined' | 'attended';
  created_at: string;
  updated_at: string;
}

/**
 * Get the first attendee associated with an invitation token
 * This function is used in client components
 */
export async function getFirstAttendeeForToken(token: string): Promise<Attendee | null> {
  const supabase = createClientComponentClient();
  
  try {
    // First, get the invitation to ensure it exists
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id')
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      return null;
    }
    
    // Now get the attendee associated with this invitation
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('invitation_token', token)
      .eq('event_id', invitation.event_id)
      .order('created_at', { ascending: true });
    
    if (attendeesError) {
      console.error('Error fetching attendees:', attendeesError);
      return null;
    }
    
    if (!attendees || attendees.length === 0) {
      return null;
    }
    
    return attendees[0] as Attendee;
  } catch (error) {
    console.error('Unexpected error in getFirstAttendeeForToken:', error);
    return null;
  }
}

/**
 * Get all attendees for a specific event
 * This function is used in server components
 */
export async function getEventAttendees(eventId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching event attendees:', error);
    return [];
  }
  
  return data as Attendee[];
}

/**
 * Update attendee information
 */
export async function updateAttendee(
  attendeeId: string, 
  data: Partial<Attendee>
) {
  const supabase = createClientComponentClient();
  
  const { data: updatedAttendee, error } = await supabase
    .from('event_attendees')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', attendeeId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating attendee:', error);
    throw error;
  }
  
  return updatedAttendee;
} 