import { useState, useEffect, useRef } from 'react';
import { getAuthenticatedUser } from '@/lib/supabase/auth-utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';

export function useDebouncedAuth(debounceMs = 300) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Timer reference for debouncing
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track the last auth event to prevent redundant processing
  const lastEventRef = useRef<string | null>(null);
  
  const fetchUser = async () => {
    try {
      setLoading(true);
      const { user, error } = await getAuthenticatedUser();
      
      if (error) {
        throw error;
      }
      
      setUser(user);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err : new Error('Unknown auth error'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Initial fetch without debouncing
    fetchUser();
    
    const supabase = createClientComponentClient();
    
    // Set up subscription with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip redundant events
      if (event === lastEventRef.current) {
        return;
      }
      
      lastEventRef.current = event;
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Debounce the auth state update
      timerRef.current = setTimeout(() => {
        console.log('Auth state changed (debounced):', event);
        fetchUser();
      }, debounceMs);
    });
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      subscription.unsubscribe();
    };
  }, [debounceMs]);
  
  return { user, loading, error, isAuthenticated: !!user };
}
