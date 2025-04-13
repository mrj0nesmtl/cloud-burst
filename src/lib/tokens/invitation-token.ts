import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateInvitationToken } from '../invitations';

/**
 * Service for managing invitation tokens throughout the user journey
 */
export const invitationTokenService = {
  /**
   * Store the invitation token in localStorage and cookies for redundancy
   * @param token - The invitation token to store
   */
  storeToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      // Store in localStorage for client components
      localStorage.setItem('invitation_token', token);
      
      // Also set as a cookie with a 7-day expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `invitation_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
    
    // Note: Server-side cookies should be handled separately
  },
  
  /**
   * Get the invitation token from multiple sources (URL, localStorage, cookies)
   * @param searchParams - Optional search params from useSearchParams
   * @returns The invitation token if found, null otherwise
   */
  getToken: (searchParams?: URLSearchParams): string | null => {
    if (typeof window === 'undefined') {
      // Server-side - we can't access localStorage or document.cookie
      return null;
    }
    
    // Priority 1: URL params if available
    if (searchParams) {
      const tokenFromUrl = searchParams.get('token');
      if (tokenFromUrl) {
        // Update storage with latest token
        invitationTokenService.storeToken(tokenFromUrl);
        return tokenFromUrl;
      }
    } else if (window.location.search) {
      // If searchParams not provided, try to get from window location
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        // Update storage with latest token
        invitationTokenService.storeToken(tokenFromUrl);
        return tokenFromUrl;
      }
    }
    
    // Priority 2: Check localStorage
    const storedToken = localStorage.getItem('invitation_token');
    if (storedToken) {
      return storedToken;
    }
    
    // Priority 3: Check cookies
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('invitation_token='));
      
    if (cookieValue) {
      return cookieValue.split('=')[1];
    }
    
    // No token found
    return null;
  },
  
  /**
   * Delete the stored invitation token
   */
  clearToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('invitation_token');
      document.cookie = 'invitation_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  },
  
  /**
   * Validate token against the database
   * @param token - The invitation token to validate
   * @returns A promise resolving to an object with validation results
   */
  validateToken: async (token: string) => {
    try {
      return await validateInvitationToken(token);
    } catch (error) {
      console.error('Error validating invitation token:', error);
      return { 
        valid: false, 
        error: 'Failed to validate invitation token' 
      };
    }
  },
  
  /**
   * Get the event ID associated with a token
   * @param token - The invitation token
   * @returns A promise resolving to the event ID if found, null otherwise
   */
  getEventIdFromToken: async (token: string): Promise<string | null> => {
    try {
      const supabase = createClientComponentClient();
      
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
};

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
  if (!token) return { valid: false, error: 'No token provided' };
  
  try {
    return await validateInvitationToken(token);
  } catch (error) {
    console.error('Server-side token validation error:', error);
    return { valid: false, error: 'Failed to validate token' };
  }
} 