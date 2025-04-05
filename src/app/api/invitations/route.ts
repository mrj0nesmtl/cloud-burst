import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Fetching invitations for user:', session.user.id);
    
    // Get user's invitations across all events with detailed event information
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        id, 
        email, 
        name, 
        status, 
        created_at, 
        updated_at,
        event_id,
        events:events!inner (
          id,
          name,
          date,
          location,
          organizer_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }
    
    // Debug: log the first invitation to check structure
    if (invitations && invitations.length > 0) {
      console.log('Sample invitation data (first item):', 
        JSON.stringify({
          id: invitations[0].id,
          event_id: invitations[0].event_id,
          events: invitations[0].events
        }, null, 2)
      );
    } else {
      console.log('No invitations found for user');
    }
    
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 