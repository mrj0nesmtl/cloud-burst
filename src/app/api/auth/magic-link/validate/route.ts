import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateToken, invalidateToken } from '@/lib/tokens/token-service';
import { AUTH_TOKEN_TYPES } from '@/lib/tokens/token-constants';

// Define schema for request validation
const requestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { token } = result.data;
    
    // Validate the token
    const metadata = await validateToken(token, AUTH_TOKEN_TYPES.MAGIC_LINK);
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const { guestId, eventId, email } = metadata;
    
    if (!guestId || !eventId || !email) {
      return NextResponse.json(
        { error: 'Invalid token metadata' },
        { status: 400 }
      );
    }
    
    // Get supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch guest details to confirm they exist
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, email, first_name, last_name, event_id')
      .eq('id', guestId)
      .eq('event_id', eventId)
      .single();
    
    if (guestError || !guest) {
      console.error('Guest lookup error:', guestError);
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }
    
    // Create a session cookie for the guest
    // This sets a cookie that will identify the guest on subsequent requests
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      userId: guestId,
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      properties: {
        eventId,
        email,
        isGuest: true,
        firstName: guest.first_name,
        lastName: guest.last_name,
      },
    });
    
    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    // Invalidate the token so it can't be used again
    await invalidateToken(token);
    
    // Return success with redirect URL
    return NextResponse.json({
      success: true,
      redirectUrl: `/guest/dashboard?event=${eventId}`,
      guestId,
      eventId,
    });
    
  } catch (error) {
    console.error('Magic link validation error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 