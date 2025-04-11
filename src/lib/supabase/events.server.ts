import { createServerClient } from './client';
import { 
  Event, 
  EventWithCounts,
  EventAttendee
} from '@/types/events';

/**
 * Get an event by ID - SERVER VERSION
 */
export async function getEvent(id: string): Promise<Event> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching event:', error);
    throw new Error(`Failed to fetch event: ${error.message}`);
  }
  
  return data as Event;
}

/**
 * Get an event with attendee and photo counts - SERVER VERSION
 */
export async function getEventWithCounts(id: string): Promise<EventWithCounts> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      attendees_count: event_attendees(count),
      photos_count: photos(count)
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching event with counts:', error);
    throw new Error(`Failed to fetch event with counts: ${error.message}`);
  }
  
  return {
    ...data,
    attendees_count: data.attendees_count[0]?.count || 0,
    photos_count: data.photos_count[0]?.count || 0
  } as EventWithCounts;
}

/**
 * Get all events for the current user - SERVER VERSION
 */
export async function getUserEvents(): Promise<Event[]> {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', session.user.id)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching user events:', error);
    throw new Error(`Failed to fetch user events: ${error.message}`);
  }
  
  return data as Event[];
}

/**
 * Get all events for the current user with counts - SERVER VERSION
 */
export async function getUserEventsWithCounts(): Promise<EventWithCounts[]> {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User not authenticated');
  }
  
  // Fetch events with basic counts
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      attendees_count: event_attendees(count),
      photos_count: photos(count)
    `)
    .eq('organizer_id', session.user.id)
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching user events with counts:', error);
    throw new Error(`Failed to fetch user events with counts: ${error.message}`);
  }
  
  // Get event IDs for further queries
  const eventIds = data.map((event: any) => event.id);
  
  // Get all accepted RSVPs for these events in a single query
  const { data: acceptedRsvps, error: rsvpError } = await supabase
    .from('invitations')
    .select('event_id')
    .in('event_id', eventIds)
    .eq('rsvp_status', 'accepted');
  
  if (rsvpError) {
    console.error('Error fetching accepted RSVPs:', rsvpError);
    // Continue anyway with just the attendee counts
  }
  
  // Count RSVPs per event ID
  const acceptedRsvpsCountMap: Record<string, number> = {};
  if (acceptedRsvps) {
    acceptedRsvps.forEach((rsvp: any) => {
      if (rsvp.event_id) {
        acceptedRsvpsCountMap[rsvp.event_id] = (acceptedRsvpsCountMap[rsvp.event_id] || 0) + 1;
      }
    });
  }
  
  return data.map((event: any) => ({
    ...event,
    attendees_count: (event.attendees_count[0]?.count || 0) + (acceptedRsvpsCountMap[event.id] || 0),
    photos_count: event.photos_count[0]?.count || 0
  })) as EventWithCounts[];
}

/**
 * Get public events - SERVER VERSION
 */
export async function getPublicEvents(): Promise<Event[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'published')
    .order('date', { ascending: true })
    .gte('date', new Date().toISOString());
    
  if (error) {
    console.error('Error fetching public events:', error);
    throw new Error(`Failed to fetch public events: ${error.message}`);
  }
  
  return data as Event[];
}

/**
 * Get event attendees - SERVER VERSION
 */
export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching event attendees:', error);
    throw new Error(`Failed to fetch event attendees: ${error.message}`);
  }
  
  return data as EventAttendee[];
}

/**
 * Check if user has access to an event - SERVER VERSION
 */
export async function checkEventAccess(eventId: string): Promise<boolean> {
  const supabase = await createServerClient();
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return false;
  }
  
  // Check if user is event organizer
  const { data: event } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', eventId)
    .single();
  
  if (event && event.organizer_id === session.user.id) {
    return true;
  }
  
  // Check if user is an attendee
  const { count } = await supabase
    .from('event_attendees')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('user_id', session.user.id);
  
  return count ? count > 0 : false;
}

/**
 * Get an event by its ID - SERVER VERSION
 */
export async function getEventById(id: string): Promise<Event> {
  return getEvent(id)
} 