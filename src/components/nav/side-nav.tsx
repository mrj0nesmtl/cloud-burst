'use client'

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface SideNavProps {
  setIsOpen?: (open: boolean) => void
}

export function SideNav({ setIsOpen }: SideNavProps) {
  const pathname = usePathname()
  const { profile, isLoading } = useAuth()
  
  // Default to user role in development mode if profile is not available
  const userRole = profile?.role || (process.env.NODE_ENV === 'development' ? 'event_host' : 'user')
  
  const isAdmin = userRole === 'super_admin' || userRole === 'admin'
  const isEventHost = userRole === 'event_host'
  const isOrganizer = userRole === 'organizer'
  const canManageEvents = isAdmin || isEventHost || isOrganizer

  // Function to handle navigation item clicks
  const handleNavClick = () => {
    // Close the mobile menu if setIsOpen is provided
    if (setIsOpen) {
      setIsOpen(false)
    }
  }

  return (
    <nav className="grid items-start gap-2 p-4">
      {/* Dashboard Section */}
      <div className="pb-2">
        <h4 className="mb-1 px-2 text-sm font-semibold">Dashboard</h4>
        <Link
          href="/protected/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === "/protected/dashboard" && "bg-muted",
            "justify-start w-full"
          )}
          onClick={handleNavClick}
        >
          Overview
        </Link>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="pb-2">
          <h4 className="mb-1 px-2 text-sm font-semibold">Administration</h4>
          <div className="grid gap-1">
            <Link
              href="/protected/admin/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/dashboard" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Admin Dashboard
            </Link>
            <Link
              href="/protected/admin/users"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/users" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Users
            </Link>
            <Link
              href="/protected/admin/roles"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/roles" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Roles
            </Link>
            <Link
              href="/protected/admin/newsletter"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/newsletter" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Newsletter
            </Link>
            <Link
              href="/protected/admin/contacts"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/contacts" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Contact Submissions
            </Link>
            <Link
              href="/protected/admin/audit-logs"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/audit-logs" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Audit Logs
            </Link>
          </div>
        </div>
      )}

      {/* Events Section */}
      {canManageEvents && (
        <div className="pb-2">
          <h4 className="mb-1 px-2 text-sm font-semibold">Events</h4>
          <div className="grid gap-1">
            <Link
              href="/protected/events/create"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/events/create" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Create Event
            </Link>
            <Link
              href="/protected/events/manage"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/events/manage" && "bg-muted",
                "justify-start w-full"
              )}
              onClick={handleNavClick}
            >
              Manage Events
            </Link>
            {(isOrganizer || isAdmin) && (
              <Link
                href="/protected/events/qr-codes"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === "/protected/events/qr-codes" && "bg-muted",
                  "justify-start w-full"
                )}
                onClick={handleNavClick}
              >
                QR Codes
              </Link>
            )}
            {(isOrganizer || isAdmin) && (
              <Link
                href="/protected/events/gallery-settings"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === "/protected/events/gallery-settings" && "bg-muted",
                  "justify-start w-full"
                )}
                onClick={handleNavClick}
              >
                Gallery Settings
              </Link>
            )}
            {(isOrganizer || isAdmin) && (
              <Link
                href="/protected/events/invitations"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === "/protected/events/invitations" && "bg-muted",
                  "justify-start w-full"
                )}
                onClick={handleNavClick}
              >
                Invitations
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Settings Section */}
      <div className="pb-2">
        <h4 className="mb-1 px-2 text-sm font-semibold">Settings</h4>
        <div className="grid gap-1">
          <Link
            href="/protected/settings/account"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/protected/settings/account" && "bg-muted",
              "justify-start w-full"
            )}
            onClick={handleNavClick}
          >
            Account
          </Link>
          <Link
            href="/protected/settings/billing"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/protected/settings/billing" && "bg-muted",
              "justify-start w-full"
            )}
            onClick={handleNavClick}
          >
            Billing
          </Link>
          <Link
            href="/protected/settings/notifications"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/protected/settings/notifications" && "bg-muted",
              "justify-start w-full"
            )}
            onClick={handleNavClick}
          >
            Notifications
          </Link>
        </div>
      </div>
    </nav>
  )
} 