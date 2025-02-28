"use client"

import { useAuthStore } from '@/lib/supabase/auth-store'
import { UserRole } from '@/types/auth'
import { redirect } from 'next/navigation'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, role } = useAuthStore()

  if (!user || !role || !allowedRoles.includes(role)) {
    redirect('/protected/dashboard')
  }

  return <>{children}</>
} 