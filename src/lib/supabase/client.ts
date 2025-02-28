import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  const client = createClientComponentClient<Database>({
    options: {
      db: {
        schema: 'public'
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-application-name': 'cloud-burst'
        }
      }
    }
  })
  return client
}

// Export a singleton instance for direct use
export const supabase = createClient()

// Helper function to get typed tables
export const getTables = () => {
  const client = createClient()
  return {
    profiles: () => client.from('profiles'),
    roles: () => client.from('roles'),
    roleCapabilities: () => client.from('role_capabilities'),
    events: () => client.from('events'),
    eventGuests: () => client.from('event_guests')
  }
}

// Type helper for database responses
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type TablesResult<T extends keyof Database['public']['Tables']> = DbResultOk<ReturnType<ReturnType<typeof getTables>[T]>['select']>

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

// Add server client creation
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
} 