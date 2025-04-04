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
        events:event_id (
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
    
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 