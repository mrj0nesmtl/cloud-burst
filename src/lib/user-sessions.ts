import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export type UserSession = {
  id: string
  user_id: string
  session_id: string
  device_info: {
    browser?: {
      name?: string
      version?: string
    }
    os?: {
      name?: string
      version?: string
    }
    device?: {
      type?: string
      model?: string
      vendor?: string
    }
  }
  ip_address: string | null
  last_active: string
  is_current: boolean
  created_at: string
}

// This function should only be called from app directory server components
export async function getUserSessions() {
  // Import dynamically to avoid issues in pages directory
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const supabase = createServerComponentClient({ cookies })
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_active', { ascending: false })
  
  if (error) {
    console.error('Error fetching user sessions:', error)
    throw error
  }
  
  return data as UserSession[]
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
    browser: {
      name: result.browser.name,
      version: result.browser.version
    },
    os: {
      name: result.os.name,
      version: result.os.version
    },
    device: {
      type: result.device.type || 'desktop',
      model: result.device.model,
      vendor: result.device.vendor
    }
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

export async function endSession(sessionId: string) {
  const supabase = createClientComponentClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  
  const { error } = await supabase
    .rpc('end_user_session', {
      p_user_id: userId,
      p_session_id: sessionId
    })
  
  if (error) {
    console.error('Error ending user session:', error)
    throw error
  }
  
  return true
}

export async function endAllOtherSessions() {
  const supabase = createClientComponentClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) {
    throw new Error('User not authenticated')
  }
  
  const userId = session.session.user.id
  const sessionId = session.session.access_token
  
  const { error } = await supabase
    .rpc('end_all_other_user_sessions', {
      p_user_id: userId,
      p_current_session_id: sessionId
    })
  
  if (error) {
    console.error('Error ending all other user sessions:', error)
    throw error
  }
  
  return true
}
