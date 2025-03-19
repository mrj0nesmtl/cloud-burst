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
  setIsOpen?: (open: boolean) => void
  collapsed?: boolean
}

export function SideNav({ setIsOpen, collapsed = false }: SideNavProps) {
  const pathname = usePathname()
  const { user, hasCapability } = useAuth()
  
  const canManageEvents = hasCapability('manage:own_events')
  const isOrganizer = user?.role === 'organizer'

  // Function to handle navigation item clicks
  const handleNavClick = () => {
    console.log('Navigation clicked')
    // Close the mobile menu if setIsOpen is provided
    if (setIsOpen) {
      setIsOpen(false)
    }
  }

  return (
    <nav className={cn(
      "flex h-full flex-col gap-4",
      collapsed ? "px-2" : "px-2"
    )}>
      {/* Dashboard Section */}
      <div className={cn(
        "flex flex-col w-full",
        collapsed ? "items-center space-y-1" : "items-start space-y-1"
      )}>
        {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Dashboard</h4>}
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
        <div className={cn(
          "flex flex-col w-full",
          collapsed ? "items-center space-y-1" : "items-start space-y-1"
        )}>
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Events</h4>}
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
            Create New Event
          </NavItem>
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
        <div className={cn(
          "flex flex-col w-full",
          collapsed ? "items-center space-y-1" : "items-start space-y-1"
        )}>
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Attendees</h4>}
          <NavItem
            href="/protected/attendees/invitations"
            active={pathname === "/protected/attendees/invitations"}
            icon={Users}
            collapsed={collapsed}
          >
            Manage Invitations
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
      <div className={cn(
        "flex flex-col w-full",
        collapsed ? "items-center space-y-1" : "items-start space-y-1"
      )}>
        {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Gallery</h4>}
        <NavItem
          href="/protected/gallery"
          active={pathname.startsWith("/protected/gallery")}
          icon={Image}
          collapsed={collapsed}
        >
          All Media
        </NavItem>
        {canManageEvents && (
          <>
            <NavItem
              href="/protected/gallery/events"
              active={pathname === "/protected/gallery/events"}
              icon={FolderOpen}
              collapsed={collapsed}
            >
              Events (Galleries)
            </NavItem>
            <NavItem
              href="/protected/gallery/moderate"
              active={pathname === "/protected/gallery/moderate"}
              icon={Shield}
              collapsed={collapsed}
            >
              Moderation
            </NavItem>
            <NavItem
              href="/protected/gallery/albums"
              active={pathname === "/protected/gallery/albums"}
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
        <div className={cn(
          "flex flex-col w-full",
          collapsed ? "items-center space-y-1" : "items-start space-y-1"
        )}>
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Analytics</h4>}
          <NavItem
            href="/protected/analytics/engagement"
            active={pathname === "/protected/analytics/engagement"}
            icon={BarChart}
            collapsed={collapsed}
          >
            Engagement Metrics
          </NavItem>
          <NavItem
            href="/protected/analytics/performance"
            active={pathname === "/protected/analytics/performance"}
            icon={LineChart}
            collapsed={collapsed}
            badge="Coming Soon"
          >
            Event Performance
          </NavItem>
        </div>
      )}

      {/* Settings Section */}
      <div className={cn(
        "flex flex-col w-full mt-auto",
        collapsed ? "items-center space-y-1" : "items-start space-y-1"
      )}>
        {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Settings</h4>}
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