'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useMediaQuery } from '@/hooks/use-media-query'

interface SidebarContextValue {
  isOpen: boolean
  isCollapsed: boolean
  setIsOpen: (value: boolean) => void
  setIsCollapsed: (value: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isOpen: false,
  isCollapsed: false,
  setIsOpen: () => {},
  setIsCollapsed: () => {},
  isMobile: false,
})

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const pathname = usePathname()
  
  // Check if we're on mobile using a media query
  const isMobile = useMediaQuery('(max-width: 1024px)')

  // Load collapsed state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    }
  }, [])

  // Save collapsed state to localStorage
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed))
  }, [isCollapsed])

  // Close mobile sidebar on route change
  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  // Reset open state when switching between mobile and desktop
  React.useEffect(() => {
    setIsOpen(false)
  }, [isMobile])

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        setIsOpen,
        setIsCollapsed,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
} 