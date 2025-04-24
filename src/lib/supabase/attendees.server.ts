import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Attendee } from './attendees';

/**
 * Get all attendees for a specific event
 * This function is used in server components only
 */
export async function getEventAttendeesServer(eventId: string) {
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
 * Get a single attendee by ID
 * For server components only
 */
export async function getAttendeeByIdServer(attendeeId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('id', attendeeId)
    .single();
  
  if (error) {
    console.error('Error fetching attendee:', error);
    return null;
  }
  
  return data as Attendee;
}

/**
 * Get attendees by invitation token
 * For server components only
 */
export async function getAttendeesByTokenServer(token: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('invitation_token', token);
  
  if (error) {
    console.error('Error fetching attendees by token:', error);
    return [];
  }
  
  return data as Attendee[];
} 