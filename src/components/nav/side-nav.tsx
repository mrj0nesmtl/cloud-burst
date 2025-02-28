import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { User } from '@supabase/auth-helpers-nextjs'
import Link from "next/link"
import { usePathname } from "next/navigation"

// Add proper Profile type
interface Profile {
  id: string
  role: 'super_admin' | 'admin' | 'event_host' | 'user' | 'guest'
  subscription_tier: 'free' | 'basic' | 'pro'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
}

interface SideNavProps {
  user: User
  profile: Profile
}

export function SideNav({ user, profile }: SideNavProps) {
  const pathname = usePathname()
  
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  const isEventHost = profile?.role === 'event_host'

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
              href="/protected/admin/users"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/users" && "bg-muted",
                "justify-start w-full"
              )}
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
            >
              Roles
            </Link>
            <Link
              href="/protected/admin/audit-logs"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === "/protected/admin/audit-logs" && "bg-muted",
                "justify-start w-full"
              )}
            >
              Audit Logs
            </Link>
          </div>
        </div>
      )}

      {/* Events Section */}
      {(isEventHost || isAdmin) && (
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
            >
              Manage Events
            </Link>
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
          >
            Notifications
          </Link>
        </div>
      </div>
    </nav>
  )
} 