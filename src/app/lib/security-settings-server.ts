import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SecuritySettings } from '@/lib/security-settings'

export async function getSecuritySettings(userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .rpc('get_or_create_security_settings', {
      p_user_id: userId
    })
    .single()
  
  if (error) {
    console.error('Error fetching security settings:', error)
    throw error
  }
  
  return data as SecuritySettings
} 