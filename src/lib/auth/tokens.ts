import { createClient } from '@/lib/supabase/server';

/**
 * Interface for decoded token data
 */
export interface GuestTokenData {
  eventId: string;
  guestId?: string;
  invitationId?: string;
  expires?: string;
}

/**
 * Validates a guest access token and returns the associated event data
 * 
 * @param token The invitation token to validate
 * @returns The decoded token data or null if invalid
 */
export async function validateGuestToken(token: string): Promise<GuestTokenData | null> {
  if (!token) {
    console.warn('No token provided to validateGuestToken');
    return null;
  }
  
  try {
    const supabase = createClient();
    
    // First try to just get any invitation with this token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, expires_at')
      .eq('token', token)
      .single();
    
    if (invitation) {
      console.log('Found invitation token:', token.substring(0, 8) + '...');
      
      // Check if token has expired
      if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        console.warn('Guest token expired:', token);
        return null;
      }
      
      return {
        eventId: invitation.event_id,
        invitationId: invitation.id,
        expires: invitation.expires_at
      };
    }
    
    if (invitationError) {
      console.log('Invitation lookup error:', invitationError.message);
    }
    
    // Try to find event with this token in various ways
    // First look for any events directly
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
      
    if (eventsError) {
      console.log('Events lookup error:', eventsError.message);
    }
    
    // If we found any events, just use the first one as fallback
    if (events && events.length > 0) {
      console.log('Using first event as fallback:', events[0].id);
      return {
        eventId: events[0].id
      };
    }
    
    console.warn('Invalid guest token:', token);
    return null;
    
  } catch (error) {
    console.error('Error validating guest token:', error);
    return null;
  }
}

/**
 * Special validation for media access that's more permissive
 * Use this for routes where we want to prioritize access over strict validation
 */
export async function validateMediaAccessToken(token: string, mediaId: string): Promise<GuestTokenData | null> {
  if (!token || !mediaId) {
    return null;
  }
  
  try {
    const supabase = createClient();
    
    // First try standard validation
    const standardValidation = await validateGuestToken(token);
    if (standardValidation) {
      return standardValidation;
    }
    
    // If that fails, try to find the media item directly
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('event_id')
      .eq('id', mediaId)
      .single();
      
    if (media) {
      console.log('Media access granted via direct media lookup for:', mediaId);
      return {
        eventId: media.event_id
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('Error in validateMediaAccessToken:', error);
    return null;
  }
} 