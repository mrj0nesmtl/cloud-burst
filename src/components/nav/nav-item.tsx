'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface NavItemProps {
  href: string
  active?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  icon?: LucideIcon
  badge?: string
  collapsed?: boolean
}

export function NavItem({
  href,
  active = false,
  children,
  className,
  onClick,
  icon: Icon,
  badge,
  collapsed = false
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative',
        'hover:bg-accent hover:text-accent-foreground',
        active && 'bg-accent text-accent-foreground',
        className
      )}
      onClick={onClick}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4',
            collapsed ? 'mx-auto' : 'mr-2'
          )}
        />
      )}
      {!collapsed && (
        <>
          <span>{children}</span>
          {badge && (
            <Badge 
              variant="outline" 
              className={cn(
                "ml-auto text-xs",
                collapsed && "hidden"
              )}
            >
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  )
} 