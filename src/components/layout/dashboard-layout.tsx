'use client'

import { useState } from 'react'
import { SideNav } from '@/components/nav/side-nav'
import { MainNav } from '@/components/layout/main-nav'
import { UserNav } from '@/components/nav/user-nav'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { Logo } from '@/components/nav/logo'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Use router.push instead of relying on the middleware redirect
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Sign out failed',
        description: 'Please try again',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">Loading your dashboard...</span>
      </div>
    )
  }

  if (!user && process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h2 className="mb-4 text-xl font-bold text-destructive">Authentication Error</h2>
          <p className="mb-4 text-muted-foreground">
            You are not authenticated or your session has expired.
          </p>
          <Button asChild variant="default">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 max-w-xs border-r bg-background shadow-lg sm:max-w-sm">
          <div className="flex h-16 items-center px-6">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          <SideNav />
        </div>
      </div>
      
      {/* Top navigation */}
      <div className="sticky top-0 z-40 border-b bg-background">
        <header className="flex h-16 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="hidden lg:block">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <MainNav />
            <UserNav
              user={user}
              profile={profile}
              onSignOut={handleSignOut}
            />
          </div>
        </header>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1">
        <div className="hidden border-r lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] w-56 overflow-y-auto py-6">
            <SideNav />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 