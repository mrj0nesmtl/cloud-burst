'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, AuthError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

/**
 * Hook to securely get and maintain current user authentication state
 * Uses supabase.auth.getUser() as recommended by Supabase for secure authentication
 */
export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Fetch initial authentication state using getUser()
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          // Create a safe error object with a definitely existing message property
          const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
            ? String(error.message) 
            : 'Authentication failed';
          
          setError(new Error(errorMessage));
          setUser(null);
        } else {
          setUser(data.user);
          setError(null);
        }
      } catch (err) {
        console.error('Unknown auth error:', err);
        setError(err instanceof Error ? err : new Error('Authentication failed'));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // When auth state changes, fetch user with getUser() for security
        if (session) {
          const { data } = await supabase.auth.getUser();
          setUser(data.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // User will be set by the onAuthStateChange listener
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // User will be cleared by the onAuthStateChange listener
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}

export default useSecureAuth; 