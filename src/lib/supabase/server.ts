import { createClientComponentClient, createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

/**
 * Create a Supabase client for use in server components or API routes
 * This is a wrapper around the createServerComponentClient function
 * that is more flexible and can be used in different contexts.
 */
export function createClient() {
  return createClientComponentClient<Database>()
}

/**
 * Create a Supabase client for use in server components
 */
export async function createServerClient(cookieStore?: any) {
  if (typeof window !== 'undefined') {
    // We're in the browser
    return createClientComponentClient<Database>()
  }

  // We're on the server
  if (cookieStore) {
    // Use provided cookies
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } else {
    // Try to dynamically import cookies (only works in App Router)
    try {
      const { cookies } = await import('next/headers')
      return createServerComponentClient<Database>({ cookies: () => cookies() })
    } catch (e) {
      // Fallback for Pages Router or other contexts
      console.warn('Could not import cookies from next/headers. Using client component client instead.')
      return createClientComponentClient<Database>()
    }
  }
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