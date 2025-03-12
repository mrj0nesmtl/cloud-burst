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
      if (!user && !process.env.NEXT_PUBLIC_BYPASS_AUTH) {
        setCapabilities([])
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
        let retryAttempts = 0;
        let capabilitiesData: string[] = [];
        let fetchSuccess = false;
        
        // Try to fetch from database with limited retries
        while (!fetchSuccess && retryAttempts < MAX_RETRY_ATTEMPTS) {
          retryAttempts++;
          
          try {
            const supabase = createClientComponentClient()
            
            // In development mode with BYPASS_AUTH, use hardcoded capabilities
            if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
              console.log('Development mode: Using hardcoded capabilities for role:', userRole)
              
              // Provide default capabilities based on role
              const defaultCapabilities: Record<string, string[]> = {
                'super_admin': ['*', 'manage:all'],
                'admin': ['manage_events', 'manage_users', 'manage_photos', 'view_dashboard', 'edit_settings'],
                'organizer': ['manage_events', 'manage_photos', 'view_dashboard'],
                'event_host': ['manage_own_events', 'upload_photos', 'view_dashboard'],
                'user': ['view_events', 'upload_photos'],
                'guest': ['view_public_events']
              }
              
              const roleCapabilities = defaultCapabilities[userRole] || defaultCapabilities['guest']
              setCapabilities(roleCapabilities)
              capabilitiesCache[userRole] = {
                data: roleCapabilities,
                timestamp: now
              }
              setLoading(false)
              return
            }
            
            // Fetch capabilities from database
            const { data, error } = await supabase
              .from('role_capabilities')
              .select('capability')
              .eq('role', userRole)
            
            if (error) {
              console.warn(`Attempt ${retryAttempts}: Error fetching capabilities:`, error)
              throw error;
            }
            
            // If successful, use the database capabilities
            capabilitiesData = data?.map(p => p.capability) || [];
            fetchSuccess = true;
          } catch (error) {
            // Last attempt failed, we'll use fallbacks
            if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
              console.warn('Max retry attempts reached, using fallback capabilities');
            }
          }
        }
        
        // If we successfully fetched capabilities, use them
        if (fetchSuccess) {
          setCapabilities(capabilitiesData);
          capabilitiesCache[userRole] = {
            data: capabilitiesData,
            timestamp: now
          };
        } else {
          // Use hardcoded fallback capabilities
          console.log('Development mode: Using hardcoded capabilities for role:', userRole);
          
          // Provide default capabilities based on role
          const defaultCapabilities: Record<string, string[]> = {
            'super_admin': ['*', 'manage:all'],
            'admin': ['manage_events', 'manage_users', 'manage_photos', 'view_dashboard', 'edit_settings'],
            'organizer': ['manage_events', 'manage_photos', 'view_dashboard'],
            'event_host': ['manage_own_events', 'upload_photos', 'view_dashboard'],
            'user': ['view_events', 'upload_photos'],
            'guest': ['view_public_events']
          };
          
          const roleCapabilities = defaultCapabilities[userRole] || defaultCapabilities['guest'];
          setCapabilities(roleCapabilities);
          
          // Cache even the fallback capabilities
          capabilitiesCache[userRole] = {
            data: roleCapabilities,
            timestamp: now
          };
        }
      } catch (err) {
        // Final error handler
        console.error('Unhandled error in usePermissions:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Use empty capabilities as last resort
        setCapabilities([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCapabilities()
  }, [user, profile, role])
  
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