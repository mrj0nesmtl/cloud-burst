import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get and validate the event ID
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Verify user has permission to access this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single()
      
    if (eventError) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    if (event.organizer_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this event' },
        { status: 403 }
      )
    }
    
    // Simple query to count invitations by status
    const { data: invitations, error: countError } = await supabase
      .from('invitations')
      .select('status, rsvp_status')
      .eq('event_id', eventId)
    
    if (countError) {
      console.error('Error fetching invitations:', countError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }
    
    // Calculate counts manually
    const stats = {
      total: invitations.length,
      pending: invitations.filter(inv => inv.status === 'pending').length,
      opened: invitations.filter(inv => inv.status === 'opened').length,
      accepted: invitations.filter(inv => inv.rsvp_status === 'accepted').length,
      declined: invitations.filter(inv => inv.rsvp_status === 'declined').length,
      sent: invitations.filter(inv => inv.status === 'sent').length,
      draft: invitations.filter(inv => inv.status === 'draft').length,
    }
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in invitation stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 