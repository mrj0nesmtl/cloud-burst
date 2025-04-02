import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for the request body
const lookupSchema = z.object({
  email: z.string().email({
    message: 'Please provide a valid email address',
  }),
});

/**
 * API endpoint for looking up invitations by email address
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    
    // Validate request body
    const { email } = lookupSchema.parse(body);
    
    // Query invitations for this email
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('id, token, event_id, status, rsvp_status, expires_at, events(id, name, date)')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }
    
    // Filter out expired invitations 
    const validInvitations = invitations.filter(invitation => {
      // Skip if status is already marked as expired
      if (invitation.status === 'expired') return false;
      
      // Check expiration date if it exists
      if (invitation.expires_at) {
        const expiresAt = new Date(invitation.expires_at);
        const now = new Date();
        if (now > expiresAt) return false;
      }
      
      return true;
    });
    
    return NextResponse.json({
      invitations: validInvitations.map(invitation => ({
        id: invitation.id,
        token: invitation.token,
        eventId: invitation.event_id,
        status: invitation.status,
        rsvpStatus: invitation.rsvp_status,
        eventName: invitation.events?.name,
        eventDate: invitation.events?.date,
      })),
    });
  } catch (error) {
    console.error('Error in invitation lookup:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 