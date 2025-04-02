import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { createServerClient } from './server';
import crypto from 'crypto';

// Global cache for user authentication to reduce redundant API calls
interface AuthCache {
  user: User | null;
  timestamp: number;
}

const authCache: AuthCache = {
  user: null,
  timestamp: 0
};

const AUTH_CACHE_DURATION_MS = 60000; // 1 minute cache duration

/**
 * Securely gets the current user with proper authentication
 * Uses supabase.auth.getUser() as recommended by Supabase for secure authentication
 * Returns null for unauthenticated users without throwing errors
 */
export async function getAuthenticatedUser() {
  const supabase = createClientComponentClient();
  const now = Date.now();
  
  // Use cached value if it's recent
  if (authCache.user && (now - authCache.timestamp < AUTH_CACHE_DURATION_MS)) {
    return { user: authCache.user, error: null };
  }
  
  try {
    // Use getUser() instead of getSession() for secure authentication
    const { data, error } = await supabase.auth.getUser();
    
    // If there's no user or session, return null without error
    if (!data?.user || error?.message?.includes('Auth session missing')) {
      return { user: null, error: null };
    }
    
    if (error) {
      console.warn('Authentication check failed:', error);
      return { user: null, error };
    }
    
    // Cache the result
    authCache.user = data.user;
    authCache.timestamp = now;
    
    return { user: data.user, error: null };
  } catch (error) {
    console.warn('Auth check failed:', error);
    return { user: null, error: null };
  }
}

/**
 * Creates a pre-authenticated guest account for an invited user
 * @param email Email address of the invited user
 * @param eventId ID of the event they're invited to
 * @param invitationId ID of the invitation sent
 * @returns Object containing user data or error
 */
export async function createGuestAccount(
  email: string,
  name: string,
  eventId: string, 
  invitationId: string
): Promise<{ user: User | null; error: any }> {
  const supabase = createClientComponentClient()
  
  try {
    // Generate a secure random password using crypto
    const generateSecureString = (length: number): string => {
      const bytes = crypto.randomBytes(length);
      return bytes.toString('base64').slice(0, length);
    };
    
    // Create a strong password with different character types
    const lowercasePart = generateSecureString(10);
    const uppercasePart = generateSecureString(10).toUpperCase();
    const numbersPart = crypto.randomBytes(5).toString('hex').slice(0, 10);
    
    // Combine the parts into a secure password
    const tempPassword = lowercasePart + uppercasePart + numbersPart;
    
    // Create user with auto-confirm enabled
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'invited_user',
      }
    })
    
    if (createError || !user) {
      console.error('Error creating user:', createError)
      return { user: null, error: createError }
    }
    
    // Create the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email,
        name,
        created_at: new Date().toISOString(),
        role: 'invited_user'
      })
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      return { user, error: profileError }
    }
    
    // Link the user to the event
    const { error: attendeeError } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.id,
        invitation_id: invitationId,
        name,
        email,
        status: 'confirmed'
      })
    
    if (attendeeError) {
      console.error('Error creating event attendee:', attendeeError)
      return { user, error: attendeeError }
    }
    
    return { user, error: null }
  } catch (error) {
    console.error('Error in createGuestAccount:', error)
    return { user: null, error }
  }
}

/**
 * Generates a secure login link for a pre-created guest account
 * @param email Email of the guest user
 * @param eventId ID of the event they're invited to
 * @returns Secure magic link for passwordless login
 */
export async function generateGuestLoginLink(email: string, eventId: string) {
  try {
    // Import server client to use admin privileges
    const { createServerClient } = await import('./server');
    const supabase = await createServerClient();
    
    // Generate a magic link for passwordless login
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/events/${eventId}/gallery?source=invitation`
      }
    });

    if (error) {
      console.error('Error generating magic link:', error);
      return { link: null, error };
    }

    return { link: data.properties.action_link, error: null };
  } catch (error) {
    console.error('Error in generateGuestLoginLink:', error);
    return { link: null, error };
  }
}
