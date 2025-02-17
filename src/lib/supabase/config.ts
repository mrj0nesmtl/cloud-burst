import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Environment variables
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase instance
export const createClient = () => {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
} 