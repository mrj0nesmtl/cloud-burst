"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CloudLightning, Menu, X, User } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

interface NavRoute {
  href: string
  label: string
}

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, signOut } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const authenticatedRoutes: NavRoute[] = [
    { href: "/protected/dashboard", label: "Dashboard" },
    { href: "/marketing/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/marketing/pricing", label: "Pricing" },
    { href: "/marketing/contact", label: "Contact" },
    { href: "/protected/profile", label: "Profile" },
    { href: "/protected/settings", label: "Settings" },
  ]

  const publicRoutes: NavRoute[] = [
    { href: "/", label: "Home" },
    { href: "/marketing/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/marketing/pricing", label: "Pricing" },
    { href: "/marketing/contact", label: "Contact" },
  ]

  // User Navigation Menu
  const UserNav = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url || undefined} alt={user?.email} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.full_name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/protected/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => signOut()}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
      isScrolled && "shadow-md"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo (always visible) */}
        <div className="flex items-center">
          <Link href={user ? "/protected/dashboard" : "/"} className="flex items-center space-x-2 group">
            <CloudLightning className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold inline-block group-hover:text-primary transition-colors">Cloud Burst</span>
          </Link>
        </div>

        {/* Desktop Nav (hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  href="/marketing/about"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                    pathname === "/marketing/about" && "bg-accent/50 font-semibold"
                  )}
                >
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/events"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                    pathname === "/events" && "bg-accent/50 font-semibold"
                  )}
                >
                  Events
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/marketing/pricing"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                    pathname === "/marketing/pricing" && "bg-accent/50 font-semibold"
                  )}
                >
                  Pricing
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/marketing/contact"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                    pathname === "/marketing/contact" && "bg-accent/50 font-semibold"
                  )}
                >
                  Contact
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/scan"
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                    pathname === "/scan" && "bg-accent/50 font-semibold"
                  )}
                >
                  Scan QR
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User actions */}
        <div className="hidden md:flex items-center space-x-2">
          <ModeToggle />
          {user ? (
            <UserNav />
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={cn(
                  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                )}
              >
                Sign in
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Nav (only visible on mobile) */}
        <div className="md:hidden flex items-center space-x-1">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="flex flex-col h-full">
                {/* Header with Logo */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <Link href={user ? "/protected/dashboard" : "/"} className="flex items-center gap-2">
                    <CloudLightning className="h-6 w-6 text-primary" />
                    <span className="font-semibold">Cloud Burst</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                {/* User Info (when authenticated) */}
                {user && (
                  <div className="px-6 py-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.email} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Role: {user.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 px-6 py-4">
                  <div className="space-y-4">
                    {/* Common Links */}
                    <div className="border-b pb-4">
                      <Link 
                        href="/marketing/about"
                        className={cn(
                          "flex items-center py-2 text-base hover:text-primary transition-colors",
                          pathname === "/marketing/about" && "text-primary font-medium"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        About
                      </Link>
                      <Link 
                        href="/events"
                        className={cn(
                          "flex items-center py-2 text-base hover:text-primary transition-colors",
                          pathname === "/events" && "text-primary font-medium"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        Events
                      </Link>
                      <Link 
                        href="/marketing/pricing"
                        className={cn(
                          "flex items-center py-2 text-base hover:text-primary transition-colors",
                          pathname === "/marketing/pricing" && "text-primary font-medium"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        Pricing
                      </Link>
                      <Link 
                        href="/scan"
                        className={cn(
                          "flex items-center py-2 text-base hover:text-primary transition-colors",
                          pathname === "/scan" && "text-primary font-medium"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        Scan QR
                      </Link>
                    </div>

                    {/* Authenticated Links */}
                    {user && (
                      <div className="space-y-3">
                        <Link 
                          href="/protected/dashboard"
                          className={cn(
                            "flex items-center py-2 text-base hover:text-primary transition-colors",
                            pathname === "/protected/dashboard" && "text-primary font-medium"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          href="/protected/profile"
                          className={cn(
                            "flex items-center py-2 text-base hover:text-primary transition-colors",
                            pathname === "/protected/profile" && "text-primary font-medium"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/protected/settings"
                          className={cn(
                            "flex items-center py-2 text-base hover:text-primary transition-colors",
                            pathname === "/protected/settings" && "text-primary font-medium"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          Settings
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>

                {/* Auth Actions */}
                <div className="px-6 py-4 border-t mt-auto">
                  {user ? (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <div className="grid gap-3">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                          Sign in
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 