'use client'

import { useState, useEffect } from 'react'
import { SideNav } from '@/components/nav/side-nav'
import { UserNav } from '@/components/nav/user-nav'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { Logo } from '@/components/nav/logo'
import { ModeToggle } from '@/components/ui/mode-toggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Load sidebar collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true')
    }
  }, [])

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])
  
  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
          <SideNav collapsed={false} setIsOpen={setSidebarOpen} />
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
          <Logo />
          <div className="ml-auto flex items-center gap-2">
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
        {/* Desktop sidebar */}
        <div className={cn(
          "hidden border-r transition-all duration-300 ease-in-out lg:block",
          sidebarCollapsed ? "w-[4.5rem]" : "w-[18rem]"
        )}>
          <div className="relative sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-[-12px] top-6 z-20 h-6 w-6 rounded-full border bg-background shadow-md"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <SideNav collapsed={sidebarCollapsed} />
          </div>
        </div>
        
        <main className={cn(
          "flex-1 w-full overflow-y-auto",
          sidebarCollapsed ? "lg:ml-[4.5rem]" : "lg:ml-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
} 