'use client'

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Menu,
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
  LogOut
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { NavItem } from './nav-item'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { user, hasCapability, isAuthenticated, signOut } = useAuth()
  
  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const canManageEvents = hasCapability('manage:own_events')
  const isOrganizer = user?.role === 'organizer'

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <nav className="flex flex-col h-full">
          {/* User Info */}
          {isAuthenticated && (
            <div className="px-4 py-4 border-b bg-muted/50">
              <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.email || "User"} />
                  <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">Role: {user?.role}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {/* Public Navigation */}
            {!isAuthenticated && (
              <div className="px-2 py-4 space-y-1">
                <NavItem href="/about" active={pathname === '/about'}>About</NavItem>
                <NavItem href="/events" active={pathname === '/events'}>Events</NavItem>
                <NavItem href="/pricing" active={pathname === '/pricing'}>Pricing</NavItem>
                <NavItem href="/contact" active={pathname === '/contact'}>Contact</NavItem>
              </div>
            )}

            {/* Protected Navigation */}
            {isAuthenticated && (
              <div className="py-2 space-y-2">
                {/* Dashboard Section */}
                <div className="px-2">
                  <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Dashboard</h2>
                  <NavItem 
                    href="/protected/overview" 
                    active={pathname === '/protected/overview'}
                    icon={LayoutDashboard}
                  >
                    Overview
                  </NavItem>
                </div>

                {/* Events Section */}
                {(isOrganizer || canManageEvents) && (
                  <div className="px-2">
                    <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Events</h2>
                    <div className="space-y-1">
                      <NavItem 
                        href="/protected/events/manage" 
                        active={pathname === '/protected/events/manage'}
                        icon={CalendarDays}
                      >
                        All Events
                      </NavItem>
                      <NavItem 
                        href="/protected/events/create" 
                        active={pathname === '/protected/events/create'}
                        icon={PlusCircle}
                      >
                        Create New Event
                      </NavItem>
                      <NavItem 
                        href="/protected/events/templates" 
                        active={pathname === '/protected/events/templates'}
                        icon={FileText}
                      >
                        Templates
                      </NavItem>
                    </div>
                  </div>
                )}

                {/* Attendees Section */}
                {canManageEvents && (
                  <div className="px-2">
                    <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Attendees</h2>
                    <div className="space-y-1">
                      <NavItem 
                        href="/protected/attendees/invitations" 
                        active={pathname === '/protected/attendees/invitations'}
                        icon={Users}
                      >
                        Manage Invitations
                      </NavItem>
                      <NavItem 
                        href="/protected/qr-codes" 
                        active={pathname === '/protected/qr-codes'}
                        icon={QrCode}
                      >
                        QR Codes
                      </NavItem>
                    </div>
                  </div>
                )}

                {/* Gallery Section */}
                <div className="px-2">
                  <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Gallery</h2>
                  <div className="space-y-1">
                    <NavItem 
                      href="/protected/gallery" 
                      active={pathname.startsWith('/protected/gallery')}
                      icon={Image}
                    >
                      All Media
                    </NavItem>
                    {canManageEvents && (
                      <>
                        <NavItem 
                          href="/protected/gallery/events" 
                          active={pathname === '/protected/gallery/events'}
                          icon={FolderOpen}
                        >
                          Events (Galleries)
                        </NavItem>
                        <NavItem 
                          href="/protected/gallery/moderate" 
                          active={pathname === '/protected/gallery/moderate'}
                          icon={Shield}
                        >
                          Moderation
                        </NavItem>
                        <NavItem 
                          href="/protected/gallery/albums" 
                          active={pathname === '/protected/gallery/albums'}
                          icon={Album}
                        >
                          Albums
                        </NavItem>
                      </>
                    )}
                  </div>
                </div>

                {/* Analytics Section */}
                {(isOrganizer || canManageEvents) && (
                  <div className="px-2">
                    <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Analytics</h2>
                    <div className="space-y-1">
                      <NavItem 
                        href="/protected/analytics/engagement" 
                        active={pathname === '/protected/analytics/engagement'}
                        icon={BarChart}
                      >
                        Engagement Metrics
                      </NavItem>
                      <NavItem 
                        href="/protected/analytics/performance" 
                        active={pathname === '/protected/analytics/performance'}
                        icon={LineChart}
                        badge="Coming Soon"
                      >
                        Event Performance
                      </NavItem>
                    </div>
                  </div>
                )}

                {/* Settings Section */}
                <div className="px-2">
                  <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Settings</h2>
                  <NavItem 
                    href="/protected/settings" 
                    active={pathname.startsWith('/protected/settings')}
                    icon={Settings}
                  >
                    Settings
                  </NavItem>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          {isAuthenticated && (
            <div className="p-4 border-t bg-muted/50">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
} 