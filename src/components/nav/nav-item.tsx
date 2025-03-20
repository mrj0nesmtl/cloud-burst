'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItemProps {
  href: string
  active?: boolean
  children: React.ReactNode
  className?: string
  icon?: LucideIcon
  badge?: string
  collapsed?: boolean
}

export function NavItem({
  href,
  active = false,
  children,
  className,
  icon: Icon,
  badge,
  collapsed = false
}: NavItemProps) {
  const content = (
    <Link
      href={href}
      className={cn(
        'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
        'hover:bg-accent hover:text-accent-foreground',
        'transition-colors duration-200',
        active && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 flex-shrink-0',
            collapsed ? 'mx-auto' : 'mr-2'
          )}
        />
      )}
      {!collapsed && (
        <>
          <span className="truncate">{children}</span>
          {badge && (
            <Badge 
              variant="outline" 
              className="ml-auto text-xs"
            >
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-normal">
          {children}
          {badge && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({badge})
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
} 