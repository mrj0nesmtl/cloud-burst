import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type SecuritySettings = {
  id: string
  user_id: string
  enable_two_factor: boolean
  auto_lock_session: boolean
  session_timeout: string
  login_notifications: boolean
  created_at: string
  updated_at: string
}

// Client-side function that works in both pages and app directory
export async function updateSecuritySettings(settings: Partial<SecuritySettings>) {
  const supabase = createClientComponentClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  
  // First, get the current settings
  const { data: currentSettings, error: fetchError } = await supabase
    .from('security_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching current security settings:', fetchError)
    throw fetchError
  }
  
  // If settings exist, update them; otherwise, insert new settings
  if (currentSettings) {
    const { error } = await supabase
      .from('security_settings')
      .update({
        enable_two_factor: settings.enable_two_factor ?? currentSettings.enable_two_factor,
        auto_lock_session: settings.auto_lock_session ?? currentSettings.auto_lock_session,
        session_timeout: settings.session_timeout ?? currentSettings.session_timeout,
        login_notifications: settings.login_notifications ?? currentSettings.login_notifications,
      })
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error updating security settings:', error)
      throw error
    }
  } else {
    const { error } = await supabase
      .from('security_settings')
      .insert({
        user_id: userId,
        enable_two_factor: settings.enable_two_factor ?? false,
        auto_lock_session: settings.auto_lock_session ?? false,
        session_timeout: settings.session_timeout ?? '30m',
        login_notifications: settings.login_notifications ?? true,
      })
    
    if (error) {
      console.error('Error inserting security settings:', error)
      throw error
    }
  }
  
  return true
}

// Client-side version of getSecuritySettings
export async function getSecuritySettingsClient(userId: string) {
  const supabase = createClientComponentClient()
  
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