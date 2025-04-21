'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  /** Additional styles to be applied to the root element */
  style?: React.CSSProperties
  /** Whether this is a protected route that requires authentication */
  isProtected?: boolean
}

/**
 * BaseLayout component that serves as the foundation for all layouts
 * Provides consistent spacing, responsive container setup, and basic grid structure
 */
export function BaseLayout({
  children,
  className,
  style,
  isProtected = false,
}: BaseLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen',
        // Base layout custom properties
        '[--sidebar-width:16rem]',
        '[--sidebar-width-collapsed:4rem]',
        '[--header-height:4rem]',
        '[--content-padding:1rem]',
        // Responsive adjustments
        'sm:[--content-padding:1.5rem]',
        'lg:[--sidebar-width:18rem]',
        'xl:[--sidebar-width:20rem]',
        className
      )}
      style={{
        // CSS Custom Properties for consistent spacing
        ...style,
      }}
      data-protected={isProtected}
    >
      {children}
    </div>
  )
}

/**
 * BaseLayoutContent component for the main content area
 * Provides consistent padding and max-width constraints
 */
export function BaseLayoutContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        'flex-1',
        'min-h-[calc(100vh-var(--header-height))]',
        'w-full',
        'p-[var(--content-padding)]',
        className
      )}
    >
      {children}
    </main>
  )
}

/**
 * BaseLayoutHeader component for consistent header styling
 */
export function BaseLayoutHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'sticky top-0',
        'h-[var(--header-height)]',
        'border-b',
        'bg-background/95',
        'backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'z-40',
        className
      )}
    >
      {children}
    </header>
  )
} 