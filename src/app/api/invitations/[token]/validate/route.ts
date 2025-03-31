import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { InvitationMetadata } from '@/types/rsvp';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase server client
    const cookieStore = cookies();
    const supabase = await createServerClient(cookieStore);
    
    // Replace the RPC function with the correct one or use a workaround
    // Option 1: Comment out this line if it's not essential
    /*
    await supabase.rpc('set_invitation_token', {
      token: token
    });
    */
    
    // Option 2: Use a type assertion to bypass TypeScript error
    await (supabase as any).rpc('set_invitation_token', {
      token: token
    });
    
    // Query the invitation
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Check if expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired', expired: true },
        { status: 410 }
      );
    }
    
    // Update status instead of opened_at
    await supabase
      .from('invitations')
      .update({ status: 'opened' })
      .eq('id', invitation.id);
    
    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name, date, location, organizer_id')
      .eq('id', invitation.event_id)
      .single();
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Fix null handling for organizer_id
    const { data: organizer } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', event.organizer_id || '')
      .single();
    
    // Get RSVP status if exists
    const { data: rsvp } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .maybeSingle();
    
    // Fix metadata type handling
    const metadata = invitation.metadata as unknown as InvitationMetadata;
    
    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation.id,
        name: invitation.name,
        email: invitation.email,
        status: invitation.status,
        rsvp_status: invitation.rsvp_status,
        created_at: invitation.created_at,
        sent_at: invitation.sent_at,
        // Remove opened_at or add it via type assertion if needed
        // opened_at: invitation.opened_at,
        expires_at: invitation.expires_at,
        plus_one_allowed: metadata?.plus_one_allowed || false,
        plus_one_used: metadata?.plus_one_used || false,
      },
      event: {
        id: invitation.event_id,
        name: event.name,
        date: event.date,
        location: event.location,
        organizer: organizer?.full_name || 'Event Host',
      },
      rsvp: rsvp || null,
    });
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
} 