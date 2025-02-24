import { createClient } from '@/lib/supabase/client'
import { type Session } from '@supabase/supabase-js'

export async function getSession(): Promise<Session | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
} 