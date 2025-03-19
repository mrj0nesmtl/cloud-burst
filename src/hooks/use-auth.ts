'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// Define types for user roles and capabilities
export type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest'

interface UserCapabilities {
  'create:events': boolean
  'manage:own_events': boolean
  'manage:all_events': boolean
  'invite:attendees': boolean
  'manage:gallery': boolean
  'access:analytics': boolean
  'manage:settings': boolean
}

// Define role-based capabilities
const roleCapabilities: Record<UserRole, Partial<UserCapabilities>> = {
  super_admin: {
    'create:events': true,
    'manage:own_events': true,
    'manage:all_events': true,
    'invite:attendees': true,
    'manage:gallery': true,
    'access:analytics': true,
    'manage:settings': true,
  },
  admin: {
    'create:events': true,
    'manage:own_events': true,
    'manage:all_events': true,
    'invite:attendees': true,
    'manage:gallery': true,
    'access:analytics': true,
    'manage:settings': true,
  },
  organizer: {
    'create:events': true,
    'manage:own_events': true,
    'invite:attendees': true,
    'manage:gallery': true,
    'access:analytics': true,
    'manage:settings': true,
  },
  event_host: {
    'create:events': false,
    'manage:own_events': true,
    'invite:attendees': true,
    'manage:gallery': true,
    'access:analytics': false,
    'manage:settings': true,
  },
  user: {
    'create:events': false,
    'manage:own_events': false,
    'invite:attendees': false,
    'manage:gallery': false,
    'access:analytics': false,
    'manage:settings': true,
  },
  guest: {
    'create:events': false,
    'manage:own_events': false,
    'invite:attendees': false,
    'manage:gallery': false,
    'access:analytics': false,
    'manage:settings': false,
  },
}

// Cache capabilities for 1 hour
const CAPABILITIES_CACHE_DURATION = 3600000 // 1 hour in milliseconds

interface Profile {
  id: string
  role: UserRole
  email: string
  full_name?: string
  avatar_url?: string
  updated_at: string
}

export function useAuth() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [capabilities, setCapabilities] = useState<Partial<UserCapabilities>>({})

  useEffect(() => {
    // Get cached capabilities
    const getCachedCapabilities = () => {
      try {
        const cached = localStorage.getItem('user_capabilities')
        if (cached) {
          const { capabilities, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CAPABILITIES_CACHE_DURATION) {
            return capabilities
          }
        }
        return null
      } catch (error) {
        console.error('Error reading cached capabilities:', error)
        return null
      }
    }

    // Set capabilities in cache
    const setCachedCapabilities = (capabilities: Partial<UserCapabilities>) => {
      try {
        localStorage.setItem('user_capabilities', JSON.stringify({
          capabilities,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.error('Error caching capabilities:', error)
      }
    }

    const getProfile = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        return profile as Profile
      } catch (error) {
        console.error('Error fetching profile:', error)
        return null
      }
    }

    const setupUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          console.log('User authenticated:', user.id)
          
          // Try to get cached capabilities first
          const cachedCapabilities = getCachedCapabilities()
          if (cachedCapabilities) {
            console.log('Using cached capabilities')
            setCapabilities(cachedCapabilities)
          } else {
            // Get fresh profile and set capabilities
            const profile = await getProfile(user.id)
            if (profile) {
              console.log('Profile loaded:', profile.role)
              setProfile(profile)
              const userRole = (profile.role || user.user_metadata?.role || 'user') as UserRole
              const newCapabilities = roleCapabilities[userRole] || roleCapabilities.user
              setCapabilities(newCapabilities)
              setCachedCapabilities(newCapabilities)
            }
          }
        } else {
          console.log('No authenticated user')
        }
      } catch (error) {
        console.error('Error setting up user:', error)
      } finally {
        setLoading(false)
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      if (event === 'SIGNED_IN' && session?.user) {
        await setupUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setCapabilities({})
        localStorage.removeItem('user_capabilities')
        console.log('User signed out')
      }
    })

    // Initial setup
    setupUser()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const hasCapability = (capability: keyof UserCapabilities): boolean => {
    return capabilities[capability] || false
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    profile,
    loading,
    hasCapability,
    signOut,
    isAuthenticated: !!user
  }
}