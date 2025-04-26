'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BaseLayout, BaseLayoutContent, BaseLayoutHeader } from './base-layout'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { Button } from '@/components/ui/button'
import { Loader2, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Logo } from '@/components/nav/logo'
import { UserNav } from '@/components/nav/user-nav'
import { SideNav } from '@/components/nav/side-nav'
import { ModeToggle } from '@/components/ui/mode-toggle'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

function ProtectedLayoutContent({ children }: ProtectedLayoutProps) {
  const { isOpen, isCollapsed, setIsOpen, setIsCollapsed, isMobile } = useSidebar()
  const { user, profile, loading: isLoading, signOut } = useAuth()
  const router = useRouter()

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show error state if no user
  if (!user && process.env.NODE_ENV !== 'development') {
    router.push('/auth/signin')
    return null
  }

  return (
    <BaseLayout isProtected className="flex">
      {/* Mobile sidebar backdrop */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r bg-background transition-all duration-300 ease-in-out',
          isMobile && !isOpen && '-translate-x-full',
          !isMobile && isCollapsed && 'w-[var(--sidebar-width-collapsed)]',
          isMobile && 'bottom-0'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-[var(--header-height)] items-center border-b px-4">
          <div className={cn('flex-1', isCollapsed && 'hidden')}>
            <Logo />
          </div>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </span>
            </Button>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-4">
          <SideNav collapsed={isCollapsed} />
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col',
          !isMobile && !isCollapsed && 'lg:pl-[var(--sidebar-width)]',
          !isMobile && isCollapsed && 'lg:pl-[var(--sidebar-width-collapsed)]'
        )}
      >
        {/* Header */}
        <BaseLayoutHeader 
          className={cn(
            'border-b',
            !isMobile && 'transition-all duration-300',
            !isMobile && !isCollapsed && 'lg:pl-[calc(var(--sidebar-width)-1rem)]', 
            !isMobile && isCollapsed && 'lg:pl-[calc(var(--sidebar-width-collapsed)-1rem)]'
          )}
        >
          <div className="flex h-full items-center gap-4 px-4">
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            )}

            {/* Header title - optional */}
            <div className="hidden md:block">
              {/* You can add a page title or breadcrumbs here */}
            </div>

            <div className="flex flex-1 items-center justify-end gap-4">
              <ModeToggle />
              <UserNav
                user={user}
                profile={profile}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </BaseLayoutHeader>

        {/* Page content */}
        <BaseLayoutContent>{children}</BaseLayoutContent>
      </div>
    </BaseLayout>
  )
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <SidebarProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </SidebarProvider>
  )
} 