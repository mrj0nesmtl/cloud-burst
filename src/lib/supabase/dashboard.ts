import { createServerClient } from './server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Type for the activity data shown in the dashboard chart
export interface EventActivityData {
  month: string;
  fullMonth: string;
  events: number;
  invitations: number;
  rsvps: number;
  media: number;
}

/**
 * Fetch event activity data for the dashboard chart
 * This query retrieves counts per month for events, invitations, RSVPs, and media uploads
 * It only returns data for the events organized by the current user
 */
export async function getEventActivityData(): Promise<EventActivityData[]> {
  const supabase = createClientComponentClient<Database>();
  
  try {
    // First get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return generateEmptyActivityData();
    }
    
    // Get all events by this organizer
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, created_at')
      .eq('organizer_id', user.id);
      
    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return generateEmptyActivityData();
    }
    
    // Get event IDs for filtering other tables
    const eventIds = events.map(event => event.id);
    
    if (eventIds.length === 0) {
      return generateEmptyActivityData();
    }
    
    // Get all invitations for these events
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('id, created_at, rsvp_status, event_id')
      .in('event_id', eventIds);
      
    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
    }
    
    // Get all media for these events
    const { data: mediaItems, error: mediaError } = await supabase
      .from('media')
      .select('id, created_at, event_id')
      .in('event_id', eventIds);
      
    if (mediaError) {
      console.error('Error fetching media:', mediaError);
    }
    
    // Process data by month
    return processActivityDataByMonth(events, invitations || [], mediaItems || []);
  } catch (error) {
    console.error('Error in getEventActivityData:', error);
    return generateEmptyActivityData();
  }
}

/**
 * Process the raw data into monthly stats
 */
function processActivityDataByMonth(
  events: any[],
  invitations: any[],
  mediaItems: any[]
): EventActivityData[] {
  // Get the past 12 months
  const months = getLast12Months();
  
  // Initialize result with zeroes
  const result = months.map(month => ({
    month: month.shortName,
    fullMonth: month.fullName,
    events: 0,
    invitations: 0,
    rsvps: 0,
    media: 0
  }));
  
  // Count events by month
  events.forEach(event => {
    const date = new Date(event.created_at);
    const monthIndex = months.findIndex(
      m => m.year === date.getFullYear() && m.month === date.getMonth()
    );
    
    if (monthIndex !== -1) {
      result[monthIndex].events += 1;
    }
  });
  
  // Count invitations and RSVPs by month
  invitations.forEach(invitation => {
    const date = new Date(invitation.created_at);
    const monthIndex = months.findIndex(
      m => m.year === date.getFullYear() && m.month === date.getMonth()
    );
    
    if (monthIndex !== -1) {
      result[monthIndex].invitations += 1;
      
      // Count accepted RSVPs
      if (invitation.rsvp_status === 'accepted') {
        result[monthIndex].rsvps += 1;
      }
    }
  });
  
  // Count media uploads by month
  mediaItems.forEach(media => {
    const date = new Date(media.created_at);
    const monthIndex = months.findIndex(
      m => m.year === date.getFullYear() && m.month === date.getMonth()
    );
    
    if (monthIndex !== -1) {
      result[monthIndex].media += 1;
    }
  });
  
  return result;
}

/**
 * Get the last 12 months from current date
 */
function getLast12Months() {
  const months = [];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    let month = currentMonth - i;
    let year = currentYear;
    
    if (month < 0) {
      month += 12;
      year -= 1;
    }
    
    months.push({
      month,
      year,
      shortName: monthNames[month],
      fullName: `${fullMonthNames[month]} ${year}`
    });
  }
  
  return months;
}

/**
 * Generate empty data if there's an error or no data
 */
function generateEmptyActivityData(): EventActivityData[] {
  const months = getLast12Months();
  
  return months.map(month => ({
    month: month.shortName,
    fullMonth: month.fullName,
    events: 0,
    invitations: 0,
    rsvps: 0,
    media: 0
  }));
}

/**
 * Get event activity data with server component
 */
export async function getEventActivityServerData(): Promise<EventActivityData[]> {
  const supabase = await createServerClient();
  
  try {
    // First get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      return generateEmptyActivityData();
    }
    
    // Get all events by this organizer
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, created_at')
      .eq('organizer_id', session.user.id);
      
    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return generateEmptyActivityData();
    }
    
    // Get event IDs for filtering other tables
    const eventIds = events.map(event => event.id);
    
    if (eventIds.length === 0) {
      return generateEmptyActivityData();
    }
    
    // Get all invitations for these events
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('id, created_at, rsvp_status, event_id')
      .in('event_id', eventIds);
      
    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
    }
    
    // Get all media for these events
    const { data: mediaItems, error: mediaError } = await supabase
      .from('media')
      .select('id, created_at, event_id')
      .in('event_id', eventIds);
      
    if (mediaError) {
      console.error('Error fetching media:', mediaError);
    }
    
    // Process data by month
    return processActivityDataByMonth(events, invitations || [], mediaItems || []);
  } catch (error) {
    console.error('Error in getEventActivityServerData:', error);
    return generateEmptyActivityData();
  }
} 