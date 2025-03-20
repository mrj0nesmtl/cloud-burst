'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SidebarContextValue {
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode
  defaultCollapsed?: boolean
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex min-h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = React.useContext(SidebarContext)

  return (
    <div
      className={cn(
        'flex flex-1 flex-col overflow-hidden',
        isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      )}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { isCollapsed, setIsCollapsed } = React.useContext(SidebarContext)

  return (
    <button
      className={cn('h-6 w-6', className)}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <span className="sr-only">Toggle sidebar</span>
      {/* Add your toggle icon here */}
    </button>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
} 