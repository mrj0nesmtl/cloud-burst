import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase Client Configuration
 * 
 * We use Next.js Auth Helpers which automatically:
 * - Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - Handle cookie-based session management
 * - Manage authentication state
 */

// Client-side Supabase instance (use in 'use client' components)
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. This will cause API errors.');
  }
  
  return createClientComponentClient<Database>({
    supabaseUrl: supabaseUrl!,
    supabaseKey: supabaseKey!,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          apikey: supabaseKey!,
        },
      },
    }
  });
}

// Server-side Supabase instance (use in Server Components)
export const createServerClient = async () => {
  // Dynamically import server-only modules
  const { cookies } = await import('next/headers')
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  
  // Get the cookie store and ensure it's properly awaited
  const cookieStore = cookies()
  
  // Create the server component client with the cookie store
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  })
}

// Singleton instance for simple client-side use
export const supabase = createClient()

// Helper function to get typed tables
export const getTables = (client = supabase) => {
  return {
    profiles: () => client.from('profiles'),
    events: () => client.from('events'),
    eventAttendees: () => client.from('event_attendees'),
    media: () => client.from('media'),
    galleries: () => client.from('galleries'),
    photos: () => client.from('photos'),
    contactFormSubmissions: () => client.from('contact_form_submissions'),
    // @ts-ignore - Tables exist in database but not in type definition
    roles: () => client.from('roles'),
    // @ts-ignore - Tables exist in database but not in type definition
    roleCapabilities: () => client.from('role_capabilities')
  }
}

// Type helper for database responses
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never

// Fix the TablesResult type to avoid TypeScript errors
export type TablesResult<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'][]

// Add error handling wrapper
export const handleError = <T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> => {
  return promise.then(({ data, error }) => {
    if (error) throw error
    if (!data) throw new Error('No data returned')
    return data
  })
}

// Add typed query builder
export const createQuery = <T extends keyof Database['public']['Tables']>(
  table: T
) => {
  return supabase.from(table)
} 