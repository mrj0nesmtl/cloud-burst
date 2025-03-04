"use client"

import { useAuthStore } from '@/lib/supabase/auth-store'
import { UserRole } from '@/types/auth'
import { redirect } from 'next/navigation'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user || !user.role || !allowedRoles.includes(user.role as UserRole)) {
    redirect('/protected/dashboard')
  }

  return <>{children}</>
} 