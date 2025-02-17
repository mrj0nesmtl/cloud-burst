import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth'

export function usePermissions() {
  const { user, capabilities } = useAuth()

  const hasCapability = (capability: string): boolean => {
    return capabilities?.includes(capability) || false
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  return {
    hasCapability,
    hasRole,
    isAdmin: hasRole('admin') || hasRole('super_admin'),
    isOrganizer: hasRole('organizer'),
    capabilities: capabilities || [],
    role: user?.role
  }
} 