'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { ReactNode } from 'react';

type Resource = 'event' | 'photo' | 'attendee' | 'user' | 'admin' | 'analytics';
type Action = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'access';

interface PermissionGateProps {
  /**
   * The action to check permission for
   */
  action: Action;
  
  /**
   * The resource to check permission for
   */
  resource: Resource;
  
  /**
   * Optional owner ID to check if user owns the resource
   */
  ownerId?: string;
  
  /**
   * Content to render if user has permission
   */
  children: ReactNode;
  
  /**
   * Optional fallback content to render if user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 */
export function PermissionGate({
  action,
  resource,
  ownerId,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, isLoading } = usePermissions();
  
  // While loading, don't render anything to prevent flashing
  if (isLoading) return null;
  
  // Check if user has permission
  const hasPermission = can(action, resource, ownerId);
  
  // Render children if user has permission, otherwise render fallback
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component that renders content only for users with specific roles
 */
export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasRole, isLoading } = usePermissions();
  
  // While loading, don't render anything to prevent flashing
  if (isLoading) return null;
  
  // Check if user has any of the specified roles
  const hasRequiredRole = hasRole(roles);
  
  // Render children if user has required role, otherwise render fallback
  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component that renders content only for users with paid subscription
 */
export function SubscriptionGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPaidSubscription, isLoading } = usePermissions();
  
  // While loading, don't render anything to prevent flashing
  if (isLoading) return null;
  
  // Check if user has paid subscription
  const isPaidUser = hasPaidSubscription();
  
  // Render children if user has paid subscription, otherwise render fallback
  return isPaidUser ? <>{children}</> : <>{fallback}</>;
} 