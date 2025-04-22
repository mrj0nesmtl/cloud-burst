import { createClientComponentClient, createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

/**
 * Create a Supabase client for use in server components or API routes
 * This is a wrapper around the createServerComponentClient function
 * that is more flexible and can be used in different contexts.
 */
export function createClient() {
  try {
    // Try to create a server component client if we're in a request context
    if (typeof window === 'undefined') {
      // We're on the server
      try {
        const { cookies } = require('next/headers');
        // Try to use cookies, but don't throw if it fails
        const cookieStore = cookies();
        return createServerComponentClient<Database>({ cookies: () => cookieStore });
      } catch (e) {
        // Fallback for contexts where cookies() isn't available
        console.warn('Could not use server component client with cookies. Using anonymous client instead.');
        return createClientComponentClient<Database>();
      }
    }
  } catch (e) {
    // Final fallback
    console.warn('Error creating supabase client, using anonymous client');
  }
  
  // Default to client component client (works in browser and as fallback)
  return createClientComponentClient<Database>();
}

/**
 * Create a Supabase client for use in server components
 * This function provides a unified way to create a server client
 * that works with the latest version of Supabase Auth Helpers
 */
export async function createServerClient(cookieStore?: any) {
  if (typeof window !== 'undefined') {
    // We're in the browser
    return createClientComponentClient<Database>()
  }

  // We're on the server
  try {
    // Use Next.js cookies API
    const { cookies } = await import('next/headers')
    
    if (cookieStore) {
      // If cookieStore is provided directly, use it
      return createServerComponentClient<Database>({ cookies })
    } else {
      // Otherwise, get cookies from next/headers
      return createServerComponentClient<Database>({ cookies })
    }
  } catch (e) {
    // Fallback for contexts where cookies() isn't available
    console.warn('Could not import cookies from next/headers. Using client component client instead.')
    return createClientComponentClient<Database>()
  }
}

/**
 * Get a Supabase client for server components
 * This is an alias for createServerClient for better compatibility
 * with parts of the application using this naming convention
 */
export async function getServerSupabase() {
  return createServerClient()
}

/**
 * Create a Supabase client for use in server actions
 */
export async function createActionClient(cookieStore?: any) {
  if (typeof window !== 'undefined') {
    // We're in the browser
    throw new Error('createActionClient should only be called on the server')
  }

  if (cookieStore) {
    // Use provided cookies
    return createServerActionClient<Database>({ cookies: () => cookieStore })
  } else {
    // Try to dynamically import cookies
    try {
      const { cookies } = await import('next/headers')
      return createServerActionClient<Database>({ cookies: () => cookies() })
    } catch (e) {
      // Fallback with error
      throw new Error('Could not import cookies from next/headers. Make sure you are in a Server Action.')
    }
  }
}

// For middleware use
export function createMiddlewareClient(context: { 
  req: Request,
  res: Response 
}) {
  const { createMiddlewareClient: createMiddleware } = require('@supabase/auth-helpers-nextjs')
  return createMiddleware(context)
} 