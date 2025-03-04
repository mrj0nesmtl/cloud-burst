'use client'

import { useAuthStore } from '@/lib/supabase/auth-store'
import { useProfile } from './use-profile'
import { usePermissions } from './use-permissions'
import { useUpdateProfile } from './use-update-profile'
import { useCallback } from 'react'
import type { AuthError } from '@/types/auth'

export function useAuth() {
  // Core auth state and actions from store
  const {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    signUp,
    resetPassword,
  } = useAuthStore()

  // Profile management
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id)
  const { mutate: updateProfile } = useUpdateProfile(user?.id)

  // Permissions
  const {
    isAdmin,
    isEventHost,
    canManageEvents,
    canUploadPhotos,
    canAccessRoute,
    getCurrentRole,
    capabilities
  } = usePermissions()
  
  // Get the current user role
  const userRole = getCurrentRole()

  // Combined loading state
  const isLoading = loading || profileLoading

  // Enhanced error handling
  const handleAuthError = useCallback((error: AuthError) => {
    console.error('Auth error:', error)
    // Add any additional error handling logic here
    return error
  }, [])

  return {
    // Auth state
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    error,

    // Auth actions
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password)
      } catch (error) {
        handleAuthError(error as AuthError)
        throw error
      }
    },
    signOut,
    signUp,
    resetPassword,

    // Profile management
    updateProfile: async (data: any) => {
      try {
        await updateProfile(data)
      } catch (error) {
        handleAuthError(error as AuthError)
        throw error
      }
    },

    // Permissions and roles
    isAdmin,
    isEventHost,
    canManageEvents,
    canUploadPhotos,
    canAccessRoute,
    userRole,
    capabilities,

    // Utility functions
    handleAuthError
  }
}