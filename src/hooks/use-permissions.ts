'use client'

import { useAuthStore } from '@/lib/supabase/auth-store'
import type { Capability, UserRole } from '@/types/auth'

export function usePermissions() {
  const { user, capabilities, hasCapability, hasRole } = useAuthStore()

  const checkPermission = (capability: Capability): boolean => {
    return hasCapability(capability)
  }

  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('super_admin')
  }

  const isEventHost = (): boolean => {
    return hasRole('event_host')
  }

  const canManageEvents = (): boolean => {
    return checkPermission('manage:events') || checkPermission('manage:own_events')
  }

  const canUploadPhotos = (): boolean => {
    return checkPermission('upload:photos') || checkPermission('upload:event_photos')
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  const getCurrentRole = (): UserRole => {
    return user?.role || 'guest'
  }

  const canAccessRoute = (route: string): boolean => {
    if (route.startsWith('/protected/admin')) {
      return isAdmin()
    }
    if (route.startsWith('/protected/events')) {
      return canManageEvents()
    }
    return true
  }

  return {
    // Permission checks
    checkPermission,
    hasAnyRole,
    isAdmin,
    isEventHost,
    canManageEvents,
    canUploadPhotos,
    
    // Role and capability access
    capabilities,
    userRole: getCurrentRole(),
    
    // Raw access to user data
    user,
    
    // Utility functions
    getCurrentRole,
    canAccessRoute
  }
} 