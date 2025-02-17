import { Session } from '@supabase/supabase-js'

export type UserRole = 'super_admin' | 'admin' | 'organizer' | 'user'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  capabilities: string[]
} 