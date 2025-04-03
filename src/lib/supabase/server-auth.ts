import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Auth utilities for server components
 * This provides methods for accessing authentication information server-side
 */
export const auth = {
  /**
   * Get the current user from the server
   */
  getUser: async () => {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Get the current session from the server
   */
  getSession: async () => {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: async () => {
    const user = await auth.getUser();
    return !!user;
  }
}; 