'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { type User } from '@supabase/auth-helpers-nextjs'

export async function getUserAuth() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return {
        session: null,
        error: null
      }
    }
    
    return {
      session,
      error: null
    }
  } catch (error) {
    console.error('Auth error:', error)
    return {
      session: null,
      error: 'Failed to get user session'
    }
  }
}

export async function requireAuth() {
  const authPromise = getUserAuth()
  
  return {
    async session() {
      const { session } = await authPromise
      if (!session) redirect('/login')
      return session
    },
    
    async user() {
      const { session } = await authPromise
      if (!session) redirect('/login')
      return session.user
    }
  }
}

export async function getRole(user: User | null | undefined) {
  if (!user) return null
  return user.user_metadata?.role || null
}

export async function hasRole(user: User | null | undefined, role: string | string[]) {
  const userRole = await getRole(user)
  if (!userRole) return false
  
  if (Array.isArray(role)) {
    return role.includes(userRole)
  }
  
  return userRole === role
} 