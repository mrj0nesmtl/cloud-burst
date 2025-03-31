import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { InvitationMetadata } from '@/types/rsvp';

/**
 * API route handler for getting RSVP status information
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from query params
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase server client
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    
    // Look up the invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, email, name, status, rsvp_status, rsvp_date, expires_at, metadata')
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      console.error('Invitation lookup error:', invitationError);
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Check if invitation is valid and not expired
    const now = new Date();
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null;
    
    if (
      invitation.status === 'expired' || 
      (expiresAt && now > expiresAt)
    ) {
      return NextResponse.json(
        { 
          error: 'Invitation has expired',
          expired: true,
          invitation: {
            id: invitation.id,
            event_id: invitation.event_id,
            status: 'expired'
          }
        },
        { status: 410 }
      );
    }
    
    // Get RSVP information
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .maybeSingle();
    
    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, date, location, organizer_id')
      .eq('id', invitation.event_id)
      .single();
    
    if (eventError || !event) {
      console.error('Event lookup error:', eventError);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get event organizer details with null handling
    const { data: organizer, error: organizerError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', event.organizer_id || '')
      .single();
    
    // Fix metadata access with type casting
    const metadata = invitation.metadata as unknown as InvitationMetadata;
    
    // Return combined data
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        event_id: invitation.event_id,
        name: invitation.name,
        email: invitation.email,
        status: invitation.status,
        rsvp_status: invitation.rsvp_status,
        rsvp_date: invitation.rsvp_date,
        expires_at: invitation.expires_at,
        plus_one_allowed: metadata?.plus_one_allowed || false,
        plus_one_used: metadata?.plus_one_used || false,
        plus_one_name: metadata?.plus_one_name || null,
      },
      rsvp: rsvp || null,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        organizer: organizer ? {
          id: organizer.id,
          name: organizer.full_name,
        } : null,
      },
    });
    
  } catch (error) {
    console.error('RSVP status error:', error);
    return NextResponse.json(
      { error: 'Failed to get RSVP status' },
      { status: 500 }
    );
  }
} 