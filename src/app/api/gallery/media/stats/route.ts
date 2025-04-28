import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify the user is logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let query = supabase.from('media').select('status, count', { count: 'exact' }).eq('status', 'pending');
    
    // Declare userEvents at the top level so it's available in the scope of the entire function
    let userEvents: { id: string }[] = [];
    
    // If eventId is provided, filter by the event
    if (eventId) {
      query = query.eq('event_id', eventId);
    } else {
      // Otherwise, get all events associated with the user
      const { data: eventData, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', session.user.id);
      
      if (eventsError) {
        console.error('Error fetching user events:', eventsError);
        return NextResponse.json(
          { error: 'Failed to fetch user events', details: eventsError.message },
          { status: 500 }
        );
      }
      
      userEvents = eventData || [];
      
      if (userEvents.length > 0) {
        const eventIds = userEvents.map(event => event.id);
        query = query.in('event_id', eventIds);
      }
    }
    
    // Get pending count
    const { count: pendingCount, error: pendingError } = await query;
    
    if (pendingError) {
      console.error('Error fetching pending count:', pendingError);
      return NextResponse.json(
        { error: 'Failed to fetch pending count', details: pendingError.message },
        { status: 500 }
      );
    }
    
    // Get approved count
    let approvedQuery = supabase.from('media').select('status, count', { count: 'exact' }).eq('status', 'approved');
    if (eventId) {
      approvedQuery = approvedQuery.eq('event_id', eventId);
    } else if (userEvents.length > 0) {
      const eventIds = userEvents.map(event => event.id);
      approvedQuery = approvedQuery.in('event_id', eventIds);
    }
    
    const { count: approvedCount, error: approvedError } = await approvedQuery;
    
    if (approvedError) {
      console.error('Error fetching approved count:', approvedError);
      return NextResponse.json(
        { error: 'Failed to fetch approved count', details: approvedError.message },
        { status: 500 }
      );
    }
    
    // Get rejected count
    let rejectedQuery = supabase.from('media').select('status, count', { count: 'exact' }).eq('status', 'rejected');
    if (eventId) {
      rejectedQuery = rejectedQuery.eq('event_id', eventId);
    } else if (userEvents.length > 0) {
      const eventIds = userEvents.map(event => event.id);
      rejectedQuery = rejectedQuery.in('event_id', eventIds);
    }
    
    const { count: rejectedCount, error: rejectedError } = await rejectedQuery;
    
    if (rejectedError) {
      console.error('Error fetching rejected count:', rejectedError);
      return NextResponse.json(
        { error: 'Failed to fetch rejected count', details: rejectedError.message },
        { status: 500 }
      );
    }
    
    // Calculate total and percentage values
    const totalCount = (pendingCount || 0) + (approvedCount || 0) + (rejectedCount || 0);
    const pendingPercentage = totalCount ? Math.round((pendingCount || 0) * 100 / totalCount) : 0;
    const approvedPercentage = totalCount ? Math.round((approvedCount || 0) * 100 / totalCount) : 0;
    const rejectedPercentage = totalCount ? Math.round((rejectedCount || 0) * 100 / totalCount) : 0;
    const reviewedPercentage = totalCount ? Math.round(((approvedCount || 0) + (rejectedCount || 0)) * 100 / totalCount) : 0;
    
    return NextResponse.json({
      success: true,
      stats: {
        pending: {
          count: pendingCount || 0,
          percentage: pendingPercentage
        },
        approved: {
          count: approvedCount || 0,
          percentage: approvedPercentage
        },
        rejected: {
          count: rejectedCount || 0,
          percentage: rejectedPercentage
        },
        total: totalCount,
        reviewed: {
          count: (approvedCount || 0) + (rejectedCount || 0),
          percentage: reviewedPercentage
        }
      }
    });
    
  } catch (error) {
    console.error('Error in media stats endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 