'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { UserRole } from '@/types/supabase'

interface RoleCapability {
  role: string
  capability: string
}

export function usePermissions() {
  const supabase = createClientComponentClient()

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    }
  })

  const { data: capabilities = [] } = useQuery<RoleCapability[]>({
    queryKey: ['role-capabilities', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const { data, error } = await supabase
        .from('role_capabilities')
        .select('*')
        .eq('role', session.user.user_metadata.role || 'user')

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const hasCapability = useCallback((capability: string): boolean => {
    return capabilities.some(cap => cap.capability === capability)
  }, [capabilities])

  const hasRole = useCallback((checkRole: UserRole): boolean => {
    return session?.user?.user_metadata.role === checkRole
  }, [session])

  const hasAnyRole = useCallback((checkRoles: UserRole[]): boolean => {
    return checkRoles.includes(session?.user?.user_metadata.role || 'guest')
  }, [session])

  return {
    hasCapability,
    hasRole,
    hasAnyRole,
    isAdmin: hasAnyRole(['super_admin', 'admin']),
    isEventHost: hasRole('event_host'),
    capabilities: capabilities.map(c => c.capability),
    role: (session?.user?.user_metadata.role || 'guest') as UserRole
  }
} 