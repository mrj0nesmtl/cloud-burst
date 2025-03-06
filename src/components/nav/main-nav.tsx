'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MainNav() {
  const pathname = usePathname()
  
  return (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/protected/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/protected/dashboard" 
            ? "text-primary" 
            : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/protected/events"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/protected/events") 
            ? "text-primary" 
            : "text-muted-foreground"
        )}
      >
        Events
      </Link>
      <Link
        href="/protected/gallery"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/protected/gallery") 
            ? "text-primary" 
            : "text-muted-foreground"
        )}
      >
        Gallery
      </Link>
    </nav>
  )
} 