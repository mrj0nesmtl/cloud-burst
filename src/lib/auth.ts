import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Server-side authentication utility
 * Returns the current session and user (if authenticated)
 */
export async function auth() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  const { data } = await supabase.auth.getSession();
  const { session } = data;
  
  return {
    session,
    supabase,
    user: session?.user ?? null
  };
} 