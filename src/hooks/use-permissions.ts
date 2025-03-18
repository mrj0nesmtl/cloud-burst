'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/hooks/use-user'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define types
export type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest';
export type Capability = string;

// Cache for role capabilities to reduce API calls
const capabilitiesCache: Record<string, {data: string[], timestamp: number}> = {}
const CACHE_DURATION_MS = 3600000; // 1 hour cache
const MAX_RETRY_ATTEMPTS = 1; // Only try once before using fallbacks

/**
 * Hook for checking user permissions based on role
 * @param role - Optional role to check permissions for (defaults to current user's role)
 * @returns Permission checking functions and capabilities
 */
export function usePermissions(role?: UserRole) {
  const { user, profile } = useUser()
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const fetchCapabilities = async () => {
      if (!user) {
        setCapabilities(['view_public_events']) // Default guest capability
        setLoading(false)
        return
      }
      
      const userRole = role || (profile?.role as UserRole) || 'guest'
      
      // Check cache first with timestamp validation
      const cachedCapabilities = capabilitiesCache[userRole];
      const now = Date.now();
      if (cachedCapabilities && (now - cachedCapabilities.timestamp < CACHE_DURATION_MS)) {
        console.log('Using cached capabilities for role:', userRole);
        setCapabilities(cachedCapabilities.data);
        setLoading(false);
        return;
      }
      
      try {
        const supabase = createClientComponentClient()
        
        // First get the user's profile to ensure we have the correct role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .single()
        
        // Only proceed with capabilities fetch if we have a valid role
        if (profileData?.role) {
          // Fetch capabilities from database
          const { data, error: fetchError } = await supabase
            .from('role_capabilities')
            .select('capability')
            .eq('role', profileData.role)
          
          if (fetchError) {
            // Provide role-specific fallback capabilities
            const fallbackCapabilities = getFallbackCapabilities(userRole)
            setCapabilities(fallbackCapabilities)
            
            // Update cache with fallbacks
            capabilitiesCache[userRole] = {
              data: fallbackCapabilities,
              timestamp: now
            }
            
            // Don't throw error, just log it
            console.warn('Using fallback capabilities due to fetch error:', fetchError)
            setLoading(false)
            return
          }
          
          // Use the fetched capabilities
          const roleCapabilities = data?.map(p => p.capability) || getFallbackCapabilities(userRole)
          setCapabilities(roleCapabilities)
          
          // Update cache
          capabilitiesCache[userRole] = {
            data: roleCapabilities,
            timestamp: now
          }
        } else {
          // No profile found, use fallback capabilities
          const fallbackCapabilities = getFallbackCapabilities(userRole)
          setCapabilities(fallbackCapabilities)
          capabilitiesCache[userRole] = {
            data: fallbackCapabilities,
            timestamp: now
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching capabilities:', err)
        // Use role-specific fallback capabilities
        const fallbackCapabilities = getFallbackCapabilities(userRole)
        setCapabilities(fallbackCapabilities)
        setError(err as Error)
        setLoading(false)
      }
    }
    
    fetchCapabilities()
  }, [user, profile, role])
  
  // Helper function to get fallback capabilities based on role
  const getFallbackCapabilities = (role: UserRole): string[] => {
    switch (role) {
      case 'super_admin':
        return ['manage:all']
      case 'admin':
        return ['manage:events', 'manage:users', 'view:analytics']
      case 'organizer':
        return ['create:events', 'manage:own_events', 'manage:photos', 'view:event_analytics']
      case 'event_host':
        return ['create:events', 'manage:own_events', 'invite:guests']
      case 'user':
        return ['view:events', 'manage:own_profile', 'upload:photos']
      default:
        return ['view:public_events']
    }
  }
  
  /**
   * Check if user has a specific capability
   */
  const hasCapability = useCallback(
    (capability: Capability | Capability[]): boolean => {
      const capsToCheck = Array.isArray(capability) ? capability : [capability];
      return capsToCheck.some(cap => 
        capabilities.includes(cap) || capabilities.includes('manage:all') || capabilities.includes('*')
      );
    },
    [capabilities]
  );
  
  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleToCheck: UserRole | UserRole[]): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      const rolesToCheck = Array.isArray(roleToCheck) ? roleToCheck : [roleToCheck];
      return rolesToCheck.includes(userRole);
    },
    [role, profile]
  );
  
  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (rolesToCheck: UserRole | UserRole[]): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      const roles = Array.isArray(rolesToCheck) ? rolesToCheck : [rolesToCheck];
      return roles.includes(userRole) || (userRole === 'super_admin'); // super_admin has access to everything
    },
    [role, profile]
  );
  
  /**
   * Check if user is an admin
   */
  const isAdmin = useCallback(
    (): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      return userRole === 'admin' || userRole === 'super_admin';
    },
    [role, profile]
  );
  
  /**
   * Check if user is an event host
   */
  const isEventHost = useCallback(
    (): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      return userRole === 'event_host';
    },
    [role, profile]
  );
  
  /**
   * Check if user is an organizer
   */
  const isOrganizer = useCallback(
    (): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      return userRole === 'organizer';
    },
    [role, profile]
  );
  
  /**
   * Check if user can manage events
   */
  const canManageEvents = useCallback(
    (): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      return ['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole);
    },
    [role, profile]
  );
  
  /**
   * Check if user has a paid subscription
   */
  const hasPaidSubscription = useCallback(
    (): boolean => {
      // This is a placeholder - implement actual subscription check
      const userRole = role || (profile?.role as UserRole) || 'guest';
      return ['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole);
    },
    [role, profile]
  );
  
  /**
   * Check if user can perform an action on a resource
   */
  const can = useCallback(
    (action: string, resource: string, ownerId?: string): boolean => {
      const userRole = role || (profile?.role as UserRole) || 'guest';
      
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
    [role, profile, user]
  );
  
  const currentRole = role || (profile?.role as UserRole) || 'guest';
  
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
    role: currentRole,
    user,
    loading,
    error
  };
} 