"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"
import { 
  Menu, 
  Home,
  Info,
  CreditCard,
  Mail,
  Github,
  Twitter,
  CloudLightning,
  Camera,
  X,
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
  User,
  Settings
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { NavItem } from '@/components/nav/nav-item'

// Public routes
const publicRoutes = [
  {
    href: "/",
    label: "Home",
    icon: Home
  },
  {
    href: "/marketing/events",
    label: "Events",
    icon: Camera
  },
  {
    href: "/marketing/about",
    label: "About",
    icon: Info
  },
  {
    href: "/marketing/pricing",
    label: "Pricing",
    icon: CreditCard
  },
  {
    href: "/marketing/contact",
    label: "Contact",
    icon: Mail
  },
]

// Protected routes organized by section
const protectedRoutes = {
  dashboard: [
    {
      href: "/protected/dashboard",
      label: "Overview",
      icon: LayoutDashboard
    }
  ],
  events: [
    {
      href: "/protected/events/manage",
      label: "All Events",
      icon: CalendarDays
    },
    {
      href: "/protected/events/create",
      label: "Create New Event",
      icon: PlusCircle
    },
    {
      href: "/protected/events/templates",
      label: "Templates",
      icon: FileText
    }
  ],
  attendees: [
    {
      href: "/protected/attendees/invitations",
      label: "Manage Invitations",
      icon: Users
    },
    {
      href: "/protected/attendees/qr-codes",
      label: "QR Codes",
      icon: QrCode
    }
  ],
  gallery: [
    {
      href: "/protected/gallery",
      label: "All Media",
      icon: Image
    },
    {
      href: "/protected/gallery/events",
      label: "Events (Galleries)",
      icon: FolderOpen
    },
    {
      href: "/protected/gallery/moderation",
      label: "Moderation",
      icon: Shield
    },
    {
      href: "/protected/gallery/albums",
      label: "Albums",
      icon: Album
    }
  ],
  analytics: [
    {
      href: "/protected/analytics/engagement",
      label: "Engagement Metrics",
      icon: BarChart
    },
    {
      href: "/protected/analytics/performance",
      label: "Event Performance",
      icon: LineChart,
      badge: "Coming Soon"
    }
  ],
  account: [
    {
      href: "/protected/profile",
      label: "Profile",
      icon: User
    },
    {
      href: "/protected/settings",
      label: "Settings",
      icon: Settings
    }
  ]
}

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, hasCapability } = useAuth()
  
  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const canManageEvents = hasCapability('manage:own_events')
  const isOrganizer = user?.role === 'organizer'

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4">
          <div className="px-2 py-4">
            <h2 className="mb-2 px-4 text-lg font-semibold">Dashboard</h2>
            <NavItem href="/protected/dashboard" active={pathname === '/protected/dashboard'}>
              Overview
            </NavItem>
          </div>

          {/* Events Section */}
          {(isOrganizer || canManageEvents) && (
            <div className="px-2 py-4">
              <h2 className="mb-2 px-4 text-lg font-semibold">Events</h2>
              <div className="space-y-1">
                <NavItem 
                  href="/protected/events/manage" 
                  active={pathname === '/protected/events/manage'}
                >
                  All Events
                </NavItem>
                <NavItem 
                  href="/protected/events/create" 
                  active={pathname === '/protected/events/create'}
                >
                  Create New Event
                </NavItem>
              </div>
            </div>
          )}

          {/* Gallery Section */}
          <div className="px-2 py-4">
            <h2 className="mb-2 px-4 text-lg font-semibold">Gallery</h2>
            <div className="space-y-1">
              <NavItem 
                href="/protected/gallery" 
                active={pathname.startsWith('/protected/gallery')}
              >
                All Media
              </NavItem>
            </div>
          </div>

          {/* Settings Section */}
          <div className="px-2 py-4">
            <h2 className="mb-2 px-4 text-lg font-semibold">Settings</h2>
            <NavItem 
              href="/protected/settings" 
              active={pathname.startsWith('/protected/settings')}
            >
              Settings
            </NavItem>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
} 