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
  total: number;
}

/**
 * Fetch event activity data for the dashboard chart
 * This query retrieves counts per month for events, invitations, RSVPs, and media uploads
 * It only returns data for the events organized by the current user
 */
export async function getEventActivityData(): Promise<EventActivityData[]> {
  const supabase = createClientComponentClient<Database>();
  
  // Set the start date to January 1, 2025
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date();
  
  try {
    // Get counts per month for events
    const { data: eventCounts, error: eventError } = await supabase
      .from('events')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (eventError) throw eventError;
    
    // Get counts per month for invitations
    const { data: invitationCounts, error: invitationError } = await supabase
      .from('invitations')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (invitationError) throw invitationError;
    
    // Get counts per month for RSVPs
    const { data: rsvpCounts, error: rsvpError } = await supabase
      .from('rsvps')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (rsvpError) throw rsvpError;
    
    // Get counts per month for media uploads
    const { data: mediaCounts, error: mediaError } = await supabase
      .from('media')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (mediaError) throw mediaError;
    
    // Process the data into monthly stats
    return processActivityDataByMonth(
      eventCounts || [],
      invitationCounts || [],
      rsvpCounts || [],
      mediaCounts || [],
      startDate,
      endDate
    );
  } catch (error) {
    console.error('Error fetching activity data:', error);
    throw error;
  }
}

/**
 * Process the raw data into monthly stats
 */
function processActivityDataByMonth(
  events: { created_at: string }[],
  invitations: { created_at: string }[],
  rsvps: { created_at: string }[],
  media: { created_at: string }[],
  startDate: Date,
  endDate: Date
): EventActivityData[] {
  const monthlyData: EventActivityData[] = [];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Create a map for each month from start date to end date
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const fullMonth = `${monthNames[month]} ${year}`;
    
    monthlyData.push({
      month: monthNames[month].substring(0, 3),
      fullMonth,
      events: 0,
      invitations: 0,
      rsvps: 0,
      media: 0,
      total: 0
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Count items for each month
  const countByMonth = (items: { created_at: string }[], type: keyof EventActivityData) => {
    items.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;
      const monthData = monthlyData.find(d => {
        const itemDate = new Date(date.getFullYear(), date.getMonth());
        const dataDate = new Date(
          parseInt(d.fullMonth.split(' ')[1]),
          monthNames.findIndex(m => m.startsWith(d.fullMonth.split(' ')[0]))
        );
        return itemDate.getTime() === dataDate.getTime();
      });
      
      if (monthData && type !== 'month' && type !== 'fullMonth' && type !== 'total') {
        monthData[type]++;
        monthData.total++;
      }
    });
  };
  
  countByMonth(events, 'events');
  countByMonth(invitations, 'invitations');
  countByMonth(rsvps, 'rsvps');
  countByMonth(media, 'media');
  
  return monthlyData;
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
    media: 0,
    total: 0
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