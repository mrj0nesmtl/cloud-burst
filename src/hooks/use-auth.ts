'use client'

import { useAuthStore } from '@/lib/supabase/auth-store'
import { useProfile } from './use-profile'
import { usePermissions } from './use-permissions'
import { useUpdateProfile } from './use-update-profile'
import { useCallback, useEffect } from 'react'
import type { AuthError, Capability } from '@/types/auth'
import { createClient } from '@/lib/supabase/client'
import { roleCapabilities } from '@/types/auth'

export function useAuth() {
  // Enhanced auth state
  const { user, session, loading: authLoading, error, isAuthenticated } = useAuthStore()
  
  // Profile state
  const { profile, loading: profileLoading, error: profileError } = useProfile(user?.id)
  
  // Permissions state
  const { capabilities, hasCapability, hasRole } = usePermissions(user?.role)
  
  // Profile update actions
  const { updateProfile, uploadAvatar } = useUpdateProfile()
  
  // Combined loading state
  const isLoading = authLoading || profileLoading
  
  // Enhanced error handling
  const handleAuthError = useCallback((error: any) => {
    // Don't treat auth session missing as an error on public pages
    if (error?.message?.includes('Auth session missing')) {
      return null
    }
    console.warn('Authentication error:', error)
    return error
  }, [])
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        // Handle unauthenticated state gracefully
        if (!user || error?.message?.includes('Auth session missing')) {
          useAuthStore.getState().setUser(null)
          useAuthStore.getState().setLoading(false)
          return
        }
        
        if (error) {
          console.warn('Error initializing auth:', error)
          return
        }
        
        if (user) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (profileError) {
            console.warn('Error fetching profile:', profileError)
            return
          }
          
          if (profile?.role) {
            // Try to fetch role capabilities from database
            try {
              const { data: rolePerms, error: roleError } = await supabase
                .from('role_capabilities')
                .select('capability')
                .eq('role', profile.role)
                
              if (!roleError && rolePerms) {
                useAuthStore.getState().setCapabilities(
                  rolePerms.map(p => p.capability as Capability)
                )
              } else {
                // Use fallback capabilities
                const fallbackCapabilities = roleCapabilities[profile.role as keyof typeof roleCapabilities] || []
                useAuthStore.getState().setCapabilities(fallbackCapabilities as Capability[])
              }
            } catch (capError) {
              // Use fallback capabilities
              const fallbackCapabilities = roleCapabilities[profile.role as keyof typeof roleCapabilities] || []
              useAuthStore.getState().setCapabilities(fallbackCapabilities as Capability[])
            }
          }
          
          // Update auth store with user profile
          useAuthStore.getState().setUser(profile)
        }
      } catch (err) {
        console.warn('Auth initialization error:', err)
      } finally {
        useAuthStore.getState().setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])
  
  // Return auth state and actions
  return {
    user,
    profile,
    session,
    isLoading,
    error: error || profileError,
    isAuthenticated,
    capabilities,
    hasCapability,
    hasRole,
    signIn: useAuthStore.getState().signIn,
    signOut: useAuthStore.getState().signOut,
    signUp: useAuthStore.getState().signUp,
    resetPassword: useAuthStore.getState().resetPassword,
    updateProfile,
    uploadAvatar,
    handleAuthError
  }
}