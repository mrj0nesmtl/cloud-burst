'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getAuthenticatedUser } from '@/lib/supabase/auth-utils'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  role: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Create a cache for user profiles to reduce API calls
const profileCache = new Map<string, UserProfile>()

/**
 * Hook to get the current authenticated user and their profile
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { user: authUser, error: authError } = await getAuthenticatedUser()
        
        // Handle unauthenticated state gracefully
        if (!authUser) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        // Only proceed with profile fetch if we have an authenticated user
        if (authUser) {
          setUser(authUser)
          
          // Get the cached user profile
          const cachedProfile = localStorage.getItem(`profile:${authUser.id}`)
          const cacheTimestamp = localStorage.getItem(`profile:${authUser.id}:timestamp`)
          const now = Date.now()
          
          // Use cache if it's less than 5 minutes old
          if (cachedProfile && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
            setProfile(JSON.parse(cachedProfile))
            setLoading(false)
            return
          }
          
          // Fetch profile from database
          const supabase = createClientComponentClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (error) throw error
          
          setProfile(data)
          
          // Cache the profile
          localStorage.setItem(`profile:${authUser.id}`, JSON.stringify(data))
          localStorage.setItem(`profile:${authUser.id}:timestamp`, now.toString())
        }
      } catch (err) {
        console.warn('Profile fetch failed:', err)
        // Don't set error for auth session missing
        if (!(err instanceof Error && err.message.includes('Auth session missing'))) {
          setError(err instanceof Error ? err : new Error('Unknown error fetching user'))
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserAndProfile()
    
    // Set up auth state change listener
    const supabase = createClientComponentClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserAndProfile()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return { user, profile, loading, error }
} 