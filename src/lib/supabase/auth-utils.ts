import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';

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
 * Replaces the insecure getSession() method
 */
export async function getAuthenticatedUser() {
  const supabase = createClientComponentClient();
  const now = Date.now();
  
  // Use cached value if it's recent
  if (authCache.user && (now - authCache.timestamp < AUTH_CACHE_DURATION_MS)) {
    return { user: authCache.user, error: null };
  }
  
  try {
    // Always use getUser() instead of getSession() for secure authentication
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Authentication error:', error);
      return { user: null, error };
    }
    
    // Cache the result
    authCache.user = data.user;
    authCache.timestamp = now;
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected auth error:', error);
    return { user: null, error: error as Error };
  }
}
