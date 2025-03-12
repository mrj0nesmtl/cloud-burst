import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getAuthenticatedUser } from '@/lib/supabase/auth-utils'
import { UAParser } from 'ua-parser-js'

export interface UserSession {
  id: string
  user_id: string
  device_info: {
    browser: string
    os: string
    device: string
    ip_address: string
  }
  created_at: string
  last_active: string
  ended_at: string | null
}

// Track current session
let currentSessionId: string | null = null

// Register session on login
export async function registerSession(deviceInfo: any) {
  const supabase = createClientComponentClient()
  const { user } = await getAuthenticatedUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: user.id,
      device_info: deviceInfo,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error registering session:', error)
    return null
  }
  
  currentSessionId = data.id
  return data as UserSession
}

// This function should only be called from app directory server components
export async function getUserSessions() {
  // Use the secure authentication method
  const { user, error } = await getAuthenticatedUser()
  
  if (error || !user) {
    throw new Error('User not authenticated')
  }
  
  const userId = user.id
  const supabase = createClientComponentClient()
  
  const { data, error: fetchError } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active', { ascending: false })
  
  if (fetchError) {
    console.error('Error fetching user sessions:', fetchError)
    throw fetchError
  }
  
  return data as UserSession[]
}

// End a specific session
export async function endSession(sessionId: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase
    .from('user_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId)
  
  if (error) {
    console.error('Error ending session:', error)
    return false
  }
  
  return true
}

// End all other sessions except current
export async function endAllOtherSessions() {
  if (!currentSessionId) return false
  
  const supabase = createClientComponentClient()
  const { user } = await getAuthenticatedUser()
  
  if (!user) return false
  
  const { error } = await supabase
    .rpc('end_all_other_user_sessions', {
      user_id_param: user.id,
      current_session_id_param: currentSessionId
    })
  
  if (error) {
    console.error('Error ending other sessions:', error)
    return false
  }
  
  return true
}

// Client-side function that works in both pages and app directory
export async function registerCurrentSession() {
  const supabase = createClientComponentClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  const sessionId = session.session.access_token
  
  // Get device info using UAParser
  const parser = new UAParser()
  const result = parser.getResult()
  
  const deviceInfo = {
    browser: result.browser.name,
    os: result.os.name,
    device: result.device.type || 'desktop',
    ip_address: null // We can't reliably get the IP address from the client
  }
  
  // Register the session
  const { data, error } = await supabase
    .rpc('register_user_session', {
      p_user_id: userId,
      p_session_id: sessionId,
      p_device_info: deviceInfo,
      p_ip_address: null // We can't reliably get the IP address from the client
    })
  
  if (error) {
    console.error('Error registering user session:', error)
    throw error
  }
  
  return data as UserSession
}
