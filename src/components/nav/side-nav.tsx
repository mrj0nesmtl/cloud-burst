'use client'

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ImageIcon, 
  BarChart, 
  Settings,
  QrCode,
  Mail,
  Upload,
  Camera,
  Image,
  Award,
  UserCog,
  CreditCard,
  BellRing,
  PlusCircle
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SideNavProps {
  setIsOpen?: (open: boolean) => void
  collapsed?: boolean
}

export function SideNav({ setIsOpen, collapsed = false }: SideNavProps) {
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

  // Helper to render nav items with proper tooltips when collapsed
  const NavItem = ({ 
    href, 
    icon, 
    label, 
    active = false 
  }: { 
    href: string; 
    icon: React.ReactNode; 
    label: string; 
    active?: boolean;
  }) => {
    const content = (
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          active && "bg-muted",
          "justify-start w-full rounded-md",
          collapsed ? "justify-center px-2" : "px-2"
        )}
        onClick={handleNavClick}
      >
        {icon}
        {!collapsed && <span className="ml-2">{label}</span>}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return content
  }

  return (
    <nav className={cn(
      "flex h-full flex-col gap-2",
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
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Overview"
          active={pathname === "/protected/dashboard"}
        />
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className={cn(
          "flex flex-col w-full",
          collapsed ? "items-center space-y-1" : "items-start space-y-1"
        )}>
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Administration</h4>}
          <NavItem
            href="/protected/admin/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Admin Dashboard"
            active={pathname === "/protected/admin/dashboard"}
          />
          <NavItem
            href="/protected/admin/users"
            icon={<Users className="h-4 w-4" />}
            label="Users"
            active={pathname === "/protected/admin/users"}
          />
          <NavItem
            href="/protected/admin/roles"
            icon={<Users className="h-4 w-4" />}
            label="Roles"
            active={pathname === "/protected/admin/roles"}
          />
          {!collapsed && (
            <>
              <NavItem
                href="/protected/admin/newsletter"
                icon={<Mail className="h-4 w-4" />}
                label="Newsletter"
                active={pathname === "/protected/admin/newsletter"}
              />
              <NavItem
                href="/protected/admin/contacts"
                icon={<Mail className="h-4 w-4" />}
                label="Contact Submissions"
                active={pathname === "/protected/admin/contacts"}
              />
              <NavItem
                href="/protected/admin/audit-logs"
                icon={<BarChart className="h-4 w-4" />}
                label="Audit Logs"
                active={pathname === "/protected/admin/audit-logs"}
              />
            </>
          )}
        </div>
      )}

      {/* Events Section */}
      {canManageEvents && (
        <div className={cn(
          "flex flex-col w-full",
          collapsed ? "items-center space-y-1" : "items-start space-y-1"
        )}>
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Events</h4>}
          <NavItem
            href="/protected/events/manage"
            icon={<Calendar className="h-4 w-4" />}
            label="All Events"
            active={pathname === "/protected/events/manage"}
          />
          <NavItem
            href="/protected/events/create"
            icon={<PlusCircle className="h-4 w-4" />}
            label="Create New Event"
            active={pathname === "/protected/events/create"}
          />
          {(isOrganizer || isAdmin) && (
            <NavItem
              href="/protected/events/templates"
              icon={<Award className="h-4 w-4" />}
              label="Templates"
              active={pathname === "/protected/events/templates"}
            />
          )}
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
            icon={<Users className="h-4 w-4" />}
            label="Manage Invitations"
            active={pathname === "/protected/attendees/invitations"}
          />
          {(isOrganizer || isAdmin) && (
            <NavItem
              href="/protected/qr-codes"
              icon={<QrCode className="h-4 w-4" />}
              label="QR Codes"
              active={pathname === "/protected/qr-codes"}
            />
          )}
        </div>
      )}

      {/* Gallery Section */}
      <div className={cn(
        "flex flex-col w-full",
        collapsed ? "items-center space-y-1" : "items-start space-y-1"
      )}>
        {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Gallery</h4>}
        <NavItem
          href="/protected/gallery/all"
          icon={<Image className="h-4 w-4" />}
          label="All Media"
          active={pathname === "/protected/gallery/all"}
        />
        {canManageEvents && (
          <>
            <NavItem
              href="/protected/gallery/events"
              icon={<Calendar className="h-4 w-4" />}
              label="Events (Galleries)"
              active={pathname === "/protected/gallery/events"}
            />
            <NavItem
              href="/protected/gallery/moderate"
              icon={<Camera className="h-4 w-4" />}
              label="Moderation"
              active={pathname === "/protected/gallery/moderate"}
            />
            <NavItem
              href="/protected/gallery/albums"
              icon={<ImageIcon className="h-4 w-4" />}
              label="Albums"
              active={pathname === "/protected/gallery/albums"}
            />
          </>
        )}
      </div>

      {/* Analytics Section - For organizers and admins */}
      {(isOrganizer || isAdmin) && (
        <div className={cn(
          "flex flex-col w-full",
          collapsed ? "items-center space-y-1" : "items-start space-y-1"
        )}>
          {!collapsed && <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2">Analytics</h4>}
          <NavItem
            href="/protected/analytics/engagement"
            icon={<Users className="h-4 w-4" />}
            label="Engagement Metrics"
            active={pathname === "/protected/analytics/engagement"}
          />
          {/* Event Performance with Coming Soon badge */}
          <div className="flex flex-col items-start w-full">
            <NavItem
              href="/protected/analytics/performance"
              icon={<BarChart className="h-4 w-4" />}
              label="Event Performance"
              active={pathname === "/protected/analytics/performance"}
            />
            {!collapsed && (
              <Badge variant="outline" className="ml-8 mt-1 text-xs font-normal">
                Coming Soon
              </Badge>
            )}
          </div>
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
          icon={<Settings className="h-4 w-4" />}
          label="Settings"
          active={pathname.startsWith("/protected/settings")}
        />
      </div>
    </nav>
  )
} 