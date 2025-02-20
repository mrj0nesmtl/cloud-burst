import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Environment variables
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase instance with cookie handling
export const createClient = () => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined'
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'sb-auth-token',
        // Only use localStorage in browser environment
        storage: isBrowser ? window.localStorage : undefined,
        debug: true
      },
      db: {
        schema: 'public'
      }
    }
  )
} 