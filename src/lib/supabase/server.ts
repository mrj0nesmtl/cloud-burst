import { createClientComponentClient, createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { cookies } from 'next/headers'
import { type RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

/**
 * Create a Supabase client for use in server components or API routes
 * This is a wrapper around the createServerComponentClient function
 * that is more flexible and can be used in different contexts.
 */
export function createClient() {
  // This is the safe pattern for server components
  if (typeof document === 'undefined') {
    // We're on the server, dynamically import the server-only code
    return createServerComponentClient<Database>({ 
      cookies: () => cookies() 
    })
  }
  
  // We're in the browser
  return createClientComponentClient<Database>()
}

/**
 * Create a Supabase client for use in server components
 */
export function createServerClient() {
  return createServerComponentClient<Database>({ 
    cookies: () => cookies() 
  })
}

/**
 * Create a Supabase client for use in server actions
 */
export function createActionClient() {
  return createServerActionClient<Database>({ 
    cookies: () => cookies() 
  })
} 