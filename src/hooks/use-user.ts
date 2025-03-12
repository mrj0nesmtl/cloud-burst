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
        // Development mode with bypass auth
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
          console.log('Development mode: Using mock profile')
          
          // Create a mock user
          const mockUser = {
            id: 'dd913d28-dd14-40f7-8a4d-6b8b64e5e8bf',
            email: 'joel.yaffe+organizer@gmail.com',
            role: 'organizer',
          } as User
          
          // Create a mock profile
          const mockProfile = {
            id: 'dd913d28-dd14-40f7-8a4d-6b8b64e5e8bf',
            email: 'joel.yaffe+organizer@gmail.com',
            role: 'organizer',
            full_name: 'Organizer User',
            username: 'organizer',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setUser(mockUser)
          setProfile(mockProfile)
          setLoading(false)
          return
        }
        
        // Use the secure authentication method
        const { user: authUser, error: authError } = await getAuthenticatedUser()
        
        if (authError) throw authError
        if (!authUser) {
          // No user found, clean up state
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        setUser(authUser)
        console.log('User authenticated:', authUser.email)
        
        // Get the cached user profile, which reduces database calls
        const cachedProfile = localStorage.getItem(`profile:${authUser.id}`)
        const cacheTimestamp = localStorage.getItem(`profile:${authUser.id}:timestamp`)
        const now = Date.now()
        
        // Use cache if it's less than 5 minutes old
        if (cachedProfile && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
          console.log('Using cached profile for user:', authUser.email)
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
        
        // Store user profile in state
        console.log('Profile fetched successfully:', data.email)
        setProfile(data)
        
        // Cache the profile to reduce database calls
        localStorage.setItem(`profile:${authUser.id}`, JSON.stringify(data))
        localStorage.setItem(`profile:${authUser.id}:timestamp`, now.toString())
      } catch (err) {
        console.error('Error in useUser hook:', err)
        setError(err instanceof Error ? err : new Error('Unknown error fetching user'))
        setUser(null)
        setProfile(null)
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