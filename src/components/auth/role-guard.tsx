"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth/auth-store"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
      return
    }

    const userRole = user?.user_metadata?.role
    if (!isLoading && !allowedRoles.includes(userRole)) {
      router.push('/protected/dashboard')
    }
  }, [user, isLoading, router, allowedRoles])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return children
} 