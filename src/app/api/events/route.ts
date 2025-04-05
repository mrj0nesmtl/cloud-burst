import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * GET /api/events
 * 
 * Fetches all events for the authenticated user
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API: Session error:', sessionError);
      return NextResponse.json({ error: 'Session error' }, { status: 401 });
    }
    
    if (!session) {
      console.error('API: Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get all user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', session.user.id)
      .order('date', { ascending: false });
    
    if (eventsError) {
      console.error('API: Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    // Debug log
    console.log(`API: Found ${events?.length || 0} events for user ${session.user.id}`);
    
    return NextResponse.json({ events: events || [] });
    
  } catch (error) {
    console.error('API: Unexpected error in events route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 