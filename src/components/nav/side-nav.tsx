'use client'

import { cn } from "@/lib/utils"
import { 
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  FileText,
  Users,
  QrCode,
  Image,
  FolderOpen,
  Shield,
  Album,
  BarChart,
  LineChart,
  Settings
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { NavItem } from './nav-item'

interface SideNavProps {
  collapsed?: boolean
}

export function SideNav({ collapsed = false }: SideNavProps) {
  const pathname = usePathname()
  const { user, hasCapability } = useAuth()
  
  const canManageEvents = hasCapability('manage:own_events')
  const isOrganizer = user?.role === 'organizer'

  return (
    <nav className={cn(
      "flex flex-col gap-6 px-2 py-4",
      collapsed && "items-center"
    )}>
      {/* Dashboard Section */}
      <div className="space-y-1">
        {!collapsed && (
          <h4 className="px-2 text-xs font-semibold text-muted-foreground">
            Dashboard
          </h4>
        )}
        <NavItem
          href="/protected/dashboard"
          active={pathname === "/protected/dashboard"}
          icon={LayoutDashboard}
          collapsed={collapsed}
        >
          Overview
        </NavItem>
      </div>

      {/* Events Section */}
      {(isOrganizer || canManageEvents) && (
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="px-2 text-xs font-semibold text-muted-foreground">
              Events
            </h4>
          )}
          <NavItem
            href="/protected/events/manage"
            active={pathname === "/protected/events/manage"}
            icon={CalendarDays}
            collapsed={collapsed}
          >
            All Events
          </NavItem>
          <NavItem
            href="/protected/events/create"
            active={pathname === "/protected/events/create"}
            icon={PlusCircle}
            collapsed={collapsed}
          >
            Create New
          </NavItem>
          {!collapsed && (
            <div className="px-2 py-1">
              <div className="text-xs text-muted-foreground border-l-2 border-muted-foreground/30 pl-2 ml-8">
                Event details include invitations, guest management, and photos
              </div>
            </div>
          )}
          <NavItem
            href="/protected/events/templates"
            active={pathname === "/protected/events/templates"}
            icon={FileText}
            collapsed={collapsed}
          >
            Templates
          </NavItem>
        </div>
      )}
      
      {/* Attendees Section */}
      {canManageEvents && (
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="px-2 text-xs font-semibold text-muted-foreground">
              Attendees
            </h4>
          )}
          <NavItem
            href="/protected/attendees/invitations"
            active={pathname === "/protected/attendees/invitations"}
            icon={Users}
            collapsed={collapsed}
            badge="All"
          >
            Event Guests
          </NavItem>
          <NavItem
            href="/protected/qr-codes"
            active={pathname === "/protected/qr-codes"}
            icon={QrCode}
            collapsed={collapsed}
          >
            QR Codes
          </NavItem>
        </div>
      )}

      {/* Gallery Section */}
      <div className="space-y-1">
        {!collapsed && (
          <h4 className="px-2 text-xs font-semibold text-muted-foreground">
            Gallery
          </h4>
        )}
        <NavItem
          href="/protected/gallery"
          active={pathname === "/protected/gallery" || (pathname.startsWith("/protected/gallery") && pathname.split("/").pop() === "all")}
          icon={Image}
          collapsed={collapsed}
        >
          All Media
        </NavItem>
        {canManageEvents && (
          <>
            <NavItem
              href="/protected/gallery/events"
              active={pathname === "/protected/gallery/events" || pathname.includes("/protected/gallery/events/")}
              icon={FolderOpen}
              collapsed={collapsed}
            >
              Events
            </NavItem>
            <NavItem
              href="/protected/gallery/moderate"
              active={pathname === "/protected/gallery/moderate" || pathname.includes("/protected/gallery/moderate/")}
              icon={Shield}
              collapsed={collapsed}
            >
              Moderation
            </NavItem>
            <NavItem
              href="/protected/gallery/albums"
              active={pathname === "/protected/gallery/albums" || pathname.includes("/protected/gallery/albums/")}
              icon={Album}
              collapsed={collapsed}
            >
              Albums
            </NavItem>
          </>
        )}
      </div>

      {/* Analytics Section */}
      {(isOrganizer || canManageEvents) && (
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="px-2 text-xs font-semibold text-muted-foreground">
              Analytics
            </h4>
          )}
          <NavItem
            href="/protected/analytics/engagement"
            active={pathname === "/protected/analytics/engagement"}
            icon={BarChart}
            collapsed={collapsed}
          >
            Engagement
          </NavItem>
          <NavItem
            href="/protected/analytics/performance"
            active={pathname === "/protected/analytics/performance"}
            icon={LineChart}
            collapsed={collapsed}
            badge="Coming Soon"
          >
            Performance
          </NavItem>
        </div>
      )}

      {/* Settings Section */}
      <div className="mt-auto space-y-1">
        {!collapsed && (
          <h4 className="px-2 text-xs font-semibold text-muted-foreground">
            Settings
          </h4>
        )}
        <NavItem
          href="/protected/settings"
          active={pathname.startsWith("/protected/settings")}
          icon={Settings}
          collapsed={collapsed}
        >
          Settings
        </NavItem>
      </div>
    </nav>
  )
} 