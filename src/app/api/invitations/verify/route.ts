import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * API route handler for verifying invitation magic links
 * This endpoint:
 * 1. Verifies the invitation token
 * 2. Uses Supabase's built-in magic link system
 * 3. Returns the invitation and event details
 */
export async function POST(request: NextRequest) {
  try {
    // Extract token from request body
    const { token } = await request.json();
    
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
      .select(`
        id,
        event_id,
        email,
        name,
        status,
        expires_at,
        metadata,
        events (
          id,
          name,
          date,
          location,
          description,
          organizer_id
        )
      `)
      .eq('token', token)
      .single();
    
    if (invitationError || !invitation) {
      console.error('Invitation lookup error:', invitationError);
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Check if invitation is expired
    const now = new Date();
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null;
    
    if (invitation.status === 'expired' || (expiresAt && now > expiresAt)) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Ensure we have an email address
    if (!invitation.email) {
      return NextResponse.json(
        { error: 'Invitation has no associated email' },
        { status: 400 }
      );
    }
    
    // Send magic link email using Supabase Auth
    const { data: magicLink, error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: invitation.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/events/${invitation.event_id}`,
        data: {
          invitation_id: invitation.id,
          event_id: invitation.event_id,
          name: invitation.name,
          role: 'guest'
        }
      }
    });
    
    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError);
      return NextResponse.json(
        { error: 'Failed to send magic link' },
        { status: 500 }
      );
    }
    
    // Update invitation status to 'opened' if not already
    if (invitation.status === 'sent') {
      await supabase
        .from('invitations')
        .update({ status: 'opened' })
        .eq('id', invitation.id);
    }
    
    // Return success with invitation and event details
    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully',
      invitation: {
        id: invitation.id,
        name: invitation.name,
        email: invitation.email,
        event: invitation.events,
        metadata: invitation.metadata
      }
    });
    
  } catch (error) {
    console.error('Invitation verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify invitation' },
      { status: 500 }
    );
  }
} 