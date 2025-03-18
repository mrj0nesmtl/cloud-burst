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
import { useAuth } from "@/hooks/useAuth"

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
      href: "/protected/events",
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
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  
  // Function to handle link clicks and close the menu
  const handleLinkClick = () => {
    setIsOpen(false)
  }

  // Helper function to render a section of protected routes
  const renderProtectedSection = (section: keyof typeof protectedRoutes, title: string) => (
    <div key={section} className="py-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <ul className="space-y-1">
        {protectedRoutes[section].map((route) => (
          <li key={route.href} className="mobile-menu-item">
            <Link 
              href={route.href}
              className={cn(
                "flex items-center w-full py-2 text-sm hover:text-primary transition-colors",
                pathname === route.href && "text-primary font-medium bg-primary/10 rounded-md"
              )}
              onClick={handleLinkClick}
            >
              <route.icon className="mr-3 h-4 w-4" />
              <span className="flex-1">{route.label}</span>
              {route.badge && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {route.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-expanded={isOpen}
          aria-label="Toggle menu"
          data-mobile-toggle
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80 mobile-menu" data-mobile-menu>
        <SheetTitle className="sr-only">
          Navigation Menu
        </SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudLightning className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Cloud Burst</h2>
            </div>
            <SheetClose className="rounded-full p-2 hover:bg-accent/50" data-mobile-close>
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </SheetClose>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {isAuthenticated ? (
              // Protected Routes
              <div className="space-y-4">
                {/* User Info */}
                <div className="px-2 py-3 mb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">Role: {user?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Section */}
                {renderProtectedSection("dashboard", "Dashboard")}
                
                {/* Events Section */}
                {renderProtectedSection("events", "Events")}
                
                {/* Attendees Section */}
                {renderProtectedSection("attendees", "Attendees")}
                
                {/* Gallery Section */}
                {renderProtectedSection("gallery", "Gallery")}
                
                {/* Analytics Section */}
                {renderProtectedSection("analytics", "Analytics")}
                
                {/* Account Section */}
                {renderProtectedSection("account", "Account")}
              </div>
            ) : (
              // Public Routes
              <ul className="space-y-1">
                {publicRoutes.map((route) => (
                  <li key={route.href} className="mobile-menu-item">
                    <Link 
                      href={route.href}
                      className={cn(
                        "flex items-center w-full py-2 text-sm hover:text-primary transition-colors px-2",
                        pathname === route.href && "text-primary font-medium bg-primary/10 rounded-md"
                      )}
                      onClick={handleLinkClick}
                    >
                      <route.icon className="mr-3 h-4 w-4" />
                      {route.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t">
            {isAuthenticated ? (
              // Sign Out Button
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  handleLinkClick()
                  // Add sign out logic here
                }}
              >
                Sign Out
              </Button>
            ) : (
              // Auth Buttons
              <div className="grid gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link 
                    href="/auth/signin" 
                    onClick={handleLinkClick}
                  >
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link 
                    href="/auth/register" 
                    onClick={handleLinkClick}
                  >
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 