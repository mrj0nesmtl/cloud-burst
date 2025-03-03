'use client'

import { useCallback } from 'react';
import { useAuthStore } from '@/lib/supabase/auth-store';
import type { Capability, UserRole } from '@/types/auth';

type Resource = 'event' | 'photo' | 'attendee' | 'user' | 'admin' | 'analytics';
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'access';

/**
 * Hook for checking user permissions based on role
 * @returns Permission checking functions
 */
export function usePermissions() {
  const { user, capabilities, hasCapability, hasRole } = useAuthStore();

  /**
   * Check if the current user can perform an action on a resource
   * @param action - The action to check
   * @param resource - The resource to check
   * @param ownerId - Optional owner ID to check ownership
   * @returns Whether the user has permission
   */
  const can = useCallback(
    (action: Action, resource: Resource, ownerId?: string): boolean => {
      if (!user) return false;

      // Check if user is owner of the resource
      const isOwner = ownerId ? user.id === ownerId : false;

      // Super admin can do everything
      if (hasRole('super_admin')) return true;

      // Admin permissions
      if (hasRole('admin')) {
        // Admins can't assign roles
        if (action === 'manage' && resource === 'user') return false;
        return true;
      }

      // Organizer permissions
      if (hasRole('organizer' as UserRole)) {
        // Organizers can manage their own events and related resources
        if (resource === 'event') {
          if (action === 'create') return true;
          return isOwner;
        }
        
        if (['photo', 'attendee'].includes(resource)) {
          return isOwner;
        }
        
        if (resource === 'analytics' && action === 'read') return true;
        
        return false;
      }

      // Event host permissions
      if (hasRole('event_host')) {
        // Event hosts can create events
        if (resource === 'event') {
          if (action === 'create') return true;
          if (action === 'delete') return false; // Cannot delete events
          return isOwner;
        }
        
        if (['photo', 'attendee'].includes(resource)) {
          return isOwner;
        }
        
        return false;
      }

      // User permissions
      if (hasRole('user')) {
        // Users can view public resources
        if (action === 'read' && ['event', 'photo'].includes(resource)) return true;
        
        // Users can manage their own profile
        if (resource === 'user' && isOwner) return true;
        
        return false;
      }

      // Guest permissions
      if (hasRole('guest')) {
        // Guests can only read public resources
        if (action === 'read' && ['event', 'photo'].includes(resource)) return true;
        return false;
      }

      return false;
    },
    [user, hasRole]
  );

  /**
   * Check if user can access a specific route
   * @param route - The route to check
   * @returns Whether the user can access the route
   */
  const canAccess = useCallback(
    (route: string): boolean => {
      if (!user) return false;

      // Public routes
      if (
        route === '/' || 
        route.startsWith('/auth/') || 
        route.startsWith('/public/')
      ) {
        return true;
      }

      // Protected routes
      if (route.startsWith('/protected/')) {
        // Admin routes
        if (route.startsWith('/protected/admin/')) {
          return hasRole('super_admin') || hasRole('admin');
        }

        // Event management routes
        if (route.startsWith('/protected/events/')) {
          return hasRole('super_admin') || hasRole('admin') || 
                 hasRole('organizer' as UserRole) || hasRole('event_host');
        }

        // Dashboard and profile routes
        return !!user;
      }

      return false;
    },
    [user, hasRole]
  );

  /**
   * Check if user has a specific role
   * @param roles - The roles to check
   * @returns Whether the user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      
      const rolesToCheck = Array.isArray(roles) ? roles : [roles];
      
      return rolesToCheck.some(role => hasRole(role as UserRole));
    },
    [user, hasRole]
  );

  /**
   * Check if user has a paid subscription
   * @returns Whether the user has a paid subscription
   */
  const hasPaidSubscription = useCallback((): boolean => {
    if (!user) return false;
    
    // Check if subscription_tier exists on user before accessing it
    return user.hasOwnProperty('subscription_tier') && 
           (user as any).subscription_tier === 'pro';
  }, [user]);

  return {
    // Original functions
    checkPermission: (capability: Capability): boolean => hasCapability(capability),
    hasAnyRole,
    isAdmin: (): boolean => hasRole('admin') || hasRole('super_admin'),
    isEventHost: (): boolean => hasRole('event_host'),
    canManageEvents: (): boolean => hasCapability('manage:events') || hasCapability('manage:own_events'),
    canUploadPhotos: (): boolean => hasCapability('upload:photos') || hasCapability('upload:event_photos'),
    getCurrentRole: (): UserRole => user?.role as UserRole || 'guest',
    canAccessRoute: (route: string): boolean => {
      if (route.startsWith('/protected/admin')) {
        return hasRole('admin') || hasRole('super_admin');
      }
      if (route.startsWith('/protected/events')) {
        return hasCapability('manage:events') || hasCapability('manage:own_events');
      }
      return true;
    },
    
    // New functions
    can,
    canAccess,
    hasRole,
    hasPaidSubscription,
    
    // Raw access to user data and capabilities
    user,
    capabilities,
  };
} 