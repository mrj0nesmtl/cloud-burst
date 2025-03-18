import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Create a typed Supabase client for server-side use
function createSupabaseServer() {
  return createServerComponentClient<Database>({
    cookies
  })
}

// Export with different names for compatibility
export const createServerClient = createSupabaseServer
export const getServerSupabase = createSupabaseServer
export const createClient = createSupabaseServer 