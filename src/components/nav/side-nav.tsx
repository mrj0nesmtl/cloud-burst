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
  Settings,
  Cpu,
  Sparkles,
  ShoppingBag,
  Tags,
  BrainCircuit,
  Database,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { NavItem } from './nav-item'

interface SideNavProps {
  collapsed?: boolean
}

export function SideNav({ collapsed = false }: SideNavProps) {
  const pathname = usePathname()
  const { user, profile, hasCapability } = useAuth()
  
  // Debug information - log the role
  console.log('SideNav - profile:', profile)
  console.log('SideNav - user role from profile:', profile?.role)
  console.log('SideNav - is admin?', profile?.role === 'admin' || profile?.role === 'super_admin')
  
  const canManageEvents = hasCapability('manage:own_events')
  const isOrganizer = profile?.role === 'organizer'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  // Force always show system section for debugging
  const alwaysShowSystem = true;

  return (
    <nav className={cn(
      "flex flex-col gap-4 px-2 pt-1 pb-4",
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
          <NavItem
            href="/protected/templates"
            active={pathname === "/protected/templates"}
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

      {/* AI Features Section - New */}
      {canManageEvents && (
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="px-2 text-xs font-semibold text-muted-foreground">
              AI Features
            </h4>
          )}
          <NavItem
            href="/protected/ai/facial-recognition"
            active={pathname === "/protected/ai/facial-recognition"}
            icon={Cpu}
            collapsed={collapsed}
          >
            Facial Recognition
          </NavItem>
          <NavItem
            href="/protected/ai/enhancements"
            active={pathname === "/protected/ai/enhancements"}
            icon={Sparkles}
            collapsed={collapsed}
          >
            Enhancements
          </NavItem>
          <NavItem
            href="/protected/ai/product-placements"
            active={pathname === "/protected/ai/product-placements"}
            icon={ShoppingBag}
            collapsed={collapsed}
          >
            Product Placements
          </NavItem>
          <NavItem
            href="/protected/ai/smart-tagging"
            active={pathname === "/protected/ai/smart-tagging"}
            icon={Tags}
            collapsed={collapsed}
            badge="Beta"
          >
            Smart Tagging
          </NavItem>
          <NavItem
            href="/protected/ai/studio"
            active={pathname === "/protected/ai/studio"}
            icon={BrainCircuit}
            collapsed={collapsed}
            badge="New"
          >
            AI Studio
          </NavItem>
        </div>
      )}

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

      {/* System Section - Always show for debugging */}
      {(isAdmin || alwaysShowSystem) && (
        <div className="space-y-1">
          {!collapsed && (
            <h4 className="px-2 text-xs font-semibold text-muted-foreground">
              System
            </h4>
          )}
          <NavItem
            href="/protected/admin/diagnostic"
            active={pathname.includes("/protected/admin/diagnostic")}
            icon={Database}
            collapsed={collapsed}
          >
            System Diagnostics
          </NavItem>
          <NavItem
            href="/protected/admin/diagnostic/guest-consistency"
            active={pathname === "/protected/admin/diagnostic/guest-consistency"}
            icon={AlertCircle}
            collapsed={collapsed}
          >
            Guest Consistency
          </NavItem>
          <NavItem
            href="/protected/admin/diagnostic/clear-cache"
            active={pathname === "/protected/admin/diagnostic/clear-cache"}
            icon={RefreshCw}
            collapsed={collapsed}
          >
            Clear Cache
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
        
        {/* Debug utilities - always show */}
        <NavItem
          href="/protected/admin/diagnostic/clear-cache"
          active={pathname === "/protected/admin/diagnostic/clear-cache"}
          icon={RefreshCw}
          collapsed={collapsed}
        >
          Clear Cache
        </NavItem>
      </div>
    </nav>
  )
} 