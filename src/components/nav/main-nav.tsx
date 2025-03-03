"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  const { user, hasAnyRole } = usePermissions()

  // Navigation items with role-based access
  const navItems = [
    {
      name: "Home",
      href: "/",
      active: pathname === "/",
      public: true,
    },
    {
      name: "Dashboard",
      href: "/protected/dashboard",
      active: pathname === "/protected/dashboard",
      public: false,
    },
    {
      name: "Events",
      href: "/protected/events",
      active: pathname.startsWith("/protected/events"),
      roles: ["super_admin", "admin", "organizer", "event_host"],
    },
    {
      name: "Gallery",
      href: "/protected/gallery",
      active: pathname.startsWith("/protected/gallery"),
      public: false,
    },
    {
      name: "Admin",
      href: "/protected/admin",
      active: pathname.startsWith("/protected/admin"),
      roles: ["super_admin", "admin"],
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems.map((item) => {
        // Public items
        if (item.public) {
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                item.active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          )
        }

        // Items that require authentication but no specific role
        if (item.public === false && !item.roles) {
          return user ? (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                item.active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ) : null
        }

        // Role-specific items
        if (item.roles && hasAnyRole(item.roles)) {
          return (
            <Button
              key={item.name}
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                item.active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          )
        }

        return null
      })}
    </nav>
  )
} 