import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateToken, storeToken } from '@/lib/tokens/token-service';
import { AUTH_TOKEN_TYPES } from '@/lib/tokens/token-constants';
import { sendMagicLinkEmail } from '@/lib/email/guest-emails';

// Define schema for request validation
const requestSchema = z.object({
  email: z.string().email('Invalid email address format'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Add debugging for email format
    console.log('Looking up guest with email:', email.toLowerCase());
    
    // Find the guest record with this email
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, email, first_name, last_name, event_id')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Add detailed error logging
    if (guestError) {
      console.log('Guest lookup error details:', guestError);
      
      // Let's try to get all guests to debug the problem
      console.log('Fetching all guests to debug:');
      const { data: allGuests, error: allGuestsError } = await supabase
        .from('guests')
        .select('id, email')
        .limit(10);
        
      if (!allGuestsError && allGuests) {
        console.log('First 10 guests in database:', allGuests);
      } else {
        console.log('Error fetching all guests:', allGuestsError);
      }
    
      // In development, provide more information
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { 
            success: true, 
            developmentInfo: { 
              warning: 'Guest not found, but returning success for security',
              error: guestError,
              searchEmail: email.toLowerCase(),
            } 
          }
        );
      }
      
      return NextResponse.json({ success: true });
    }
    
    // Generate the magic link token
    const token = generateToken();
    
    // Store token in the database
    const stored = await storeToken(token, {
      email: email.toLowerCase(),
      guestId: guest.id,
      eventId: guest.event_id,
      type: AUTH_TOKEN_TYPES.MAGIC_LINK
    });
    
    if (!stored) {
      console.error('Failed to store token');
      return NextResponse.json(
        { error: 'Failed to generate magic link' },
        { status: 500 }
      );
    }
    
    // Get event details to include in the email
    const { data: event } = await supabase
      .from('events')
      .select('name, host_name')
      .eq('id', guest.event_id)
      .single();
    
    // Create the magic link URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;
    const magicLinkUrl = `${origin}/auth/magic-link?token=${token}`;
    
    // Send the email with the magic link
    const emailSent = await sendMagicLinkEmail({
      to: email,
      name: `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Guest',
      eventName: event?.name || 'Event',
      magicLink: magicLinkUrl,
      hostName: event?.host_name || 'Event Host'
    });
    
    // Return success response
    const response = { success: true };
    
    // In development, include the magic link URL in the response
    if (process.env.NODE_ENV === 'development') {
      Object.assign(response, { 
        magicLink: magicLinkUrl,
        debugInfo: {
          guestId: guest.id,
          eventId: guest.event_id,
          emailSent
        }
      });
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Magic link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 