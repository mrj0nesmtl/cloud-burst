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
    console.error('Authentication error:', error)
    // Add additional error handling logic here if needed
    return error
  }, [])
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        
        // Use getUser instead of getSession for better security
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error initializing auth:', error)
          return
        }
        
        if (user) {
          console.log('User authenticated:', user.email)
          
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            
          if (profileError) {
            console.error('Error fetching profile:', profileError)
            return
          }
          
          if (profile?.role) {
            console.log('Role:', profile.role)
            
            // Try to fetch role capabilities from database
            try {
              const { data: rolePerms, error: roleError } = await supabase
                .from('role_capabilities')
                .select('capability')
                .eq('role', profile.role)
                
              if (!roleError) {
                // If successful, use the database capabilities
                useAuthStore.getState().setCapabilities(
                  rolePerms?.map(p => p.capability as Capability) ?? []
                )
              } else {
                // If there's an error, use the hardcoded capabilities from types
                console.warn('Using fallback capabilities due to database error:', roleError.message)
                const fallbackCapabilities = roleCapabilities[profile.role as keyof typeof roleCapabilities] || []
                useAuthStore.getState().setCapabilities(fallbackCapabilities as Capability[])
              }
            } catch (capError) {
              console.warn('Error fetching capabilities, using fallback:', capError)
              const fallbackCapabilities = roleCapabilities[profile.role as keyof typeof roleCapabilities] || []
              useAuthStore.getState().setCapabilities(fallbackCapabilities as Capability[])
            }
          }
          
          // Update auth store with user profile
          useAuthStore.getState().setUser(profile)
        } else {
          console.log('No authenticated user')
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
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