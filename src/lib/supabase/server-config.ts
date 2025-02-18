import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Server-side Supabase instance
export const createServer = () => {
  // Get the cookies from the request
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // Handle cookie setting errors in development
            console.error('Cookie setting error:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name, options)
          } catch (error) {
            // Handle cookie deletion errors in development
            console.error('Cookie deletion error:', error)
          }
        }
      }
    }
  )
}

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
} 