import { createClient } from './client'
import { UserRole } from '@/types/auth'

export async function createTestUser(email: string, role: UserRole = 'user') {
  const supabase = createClient()
  
  // Create the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'Test123!@#',
    options: {
      data: {
        role: role,
      }
    }
  })

  if (authError) throw authError

  // Create profile record
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      email: email,
      role: role,
    })

  if (profileError) throw profileError

  return authData.user
} 