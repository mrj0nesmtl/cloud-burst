'use client'

import { useAuthStore } from '@/lib/supabase/auth-store';
import { useCallback, useMemo } from 'react';
import type { UserRole, Capability } from '@/types/auth';
import { roleCapabilities } from '@/types/auth';

/**
 * Hook for checking user permissions based on role
 * @param role - Optional role to check permissions for (defaults to current user's role)
 * @returns Permission checking functions and capabilities
 */
export function usePermissions(role?: UserRole) {
  const { user, capabilities: storeCapabilities } = useAuthStore();
  
  // Use provided role or fall back to user's role from store
  const userRole = role || user?.role || 'user';
  
  // Get capabilities for the role
  const capabilities = storeCapabilities.length > 0 
    ? storeCapabilities 
    : (roleCapabilities[userRole as keyof typeof roleCapabilities] || []) as Capability[];
  
  /**
   * Check if user has a specific capability
   */
  const hasCapability = useCallback(
    (capability: Capability | Capability[]): boolean => {
      const capsToCheck = Array.isArray(capability) ? capability : [capability];
      return capsToCheck.some(cap => 
        capabilities.includes(cap) || capabilities.includes('manage:all')
      );
    },
    [capabilities]
  );
  
  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleToCheck: UserRole | UserRole[]): boolean => {
      const rolesToCheck = Array.isArray(roleToCheck) ? roleToCheck : [roleToCheck];
      return rolesToCheck.includes(userRole);
    },
    [userRole]
  );
  
  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (rolesToCheck: UserRole | UserRole[]): boolean => {
      const roles = Array.isArray(rolesToCheck) ? rolesToCheck : [rolesToCheck];
      return roles.includes(userRole) || (userRole === 'super_admin'); // super_admin has access to everything
    },
    [userRole]
  );
  
  /**
   * Check if user is an admin
   */
  const isAdmin = useCallback(
    (): boolean => {
      return userRole === 'admin' || userRole === 'super_admin';
    },
    [userRole]
  );
  
  /**
   * Check if user is an event host
   */
  const isEventHost = useCallback(
    (): boolean => {
      return userRole === 'event_host';
    },
    [userRole]
  );
  
  /**
   * Check if user is an organizer
   */
  const isOrganizer = useCallback(
    (): boolean => {
      return userRole === 'organizer';
    },
    [userRole]
  );
  
  /**
   * Check if user can manage events
   */
  const canManageEvents = useCallback(
    (): boolean => {
      return ['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole);
    },
    [userRole]
  );
  
  /**
   * Check if user has a paid subscription
   */
  const hasPaidSubscription = useCallback(
    (): boolean => {
      // This is a placeholder - implement actual subscription check
      return ['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole);
    },
    [userRole]
  );
  
  /**
   * Check if user can perform an action on a resource
   */
  const can = useCallback(
    (action: string, resource: string, ownerId?: string): boolean => {
      // Super admin can do everything
      if (userRole === 'super_admin') return true;

      // Check if user is the owner of the resource
      if (ownerId && user?.id === ownerId) return true;

      // Check specific role-based permissions
      switch (userRole) {
        case 'admin':
          return true; // Admins can do everything except super admin actions
        
        case 'organizer':
          // Organizers can manage their own events and related resources
          return ['event', 'photo', 'attendee'].includes(resource) && 
                 ['create', 'read', 'update', 'delete', 'manage'].includes(action);
        
        case 'event_host':
          // Event hosts can manage events they're assigned to
          return ['event', 'photo', 'attendee'].includes(resource) && 
                 ['create', 'read', 'update'].includes(action);
        
        case 'user':
          // Regular users can read public resources and manage their own content
          return action === 'read' || (!!ownerId && !!user?.id && user.id === ownerId);
        
        default:
          return false;
      }
    },
    [userRole, user?.id]
  );
  
  return {
    capabilities,
    hasCapability,
    hasRole,
    hasAnyRole,
    isAdmin,
    isEventHost,
    isOrganizer,
    canManageEvents,
    hasPaidSubscription,
    can,
    userRole,
    user
  };
} 