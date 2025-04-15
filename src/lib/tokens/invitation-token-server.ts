import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { validateInvitationToken } from '../invitations';

/**
 * Server-side function to get token from cookies
 * For use in Server Components
 */
export async function getTokenFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get('invitation_token')?.value || null;
}

/**
 * Server-side function to validate token and get invitation
 * For use in Server Components
 * @param token - The invitation token to validate
 */
export async function validateTokenServerSide(token: string) {
  try {
    return await validateInvitationToken(token);
  } catch (error) {
    console.error('Error validating token server-side:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
}

/**
 * Get the event ID associated with a token - server-side implementation
 * @param token - The invitation token
 * @returns A promise resolving to the event ID if found, null otherwise
 */
export async function getEventIdFromTokenServerSide(token: string): Promise<string | null> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data, error } = await supabase
      .from('invitations')
      .select('event_id')
      .eq('token', token)
      .single();
      
    if (error || !data) {
      console.error('Error fetching event ID from token:', error);
      return null;
    }
    
    return data.event_id;
  } catch (error) {
    console.error('Error in getEventIdFromToken:', error);
    return null;
  }
} 