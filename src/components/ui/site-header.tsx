"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CloudLightning, Menu, X } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
      isScrolled && "shadow-md"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo (always visible) */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
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
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User actions */}
        <div className="hidden md:flex items-center space-x-2">
          <ModeToggle />
          <Link
            href="/auth/login"
            className={cn(
              "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
            )}
          >
            Sign in
          </Link>
          <Link href="/auth/register">
            <Button>Get Started</Button>
          </Link>
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
                  <div className="flex items-center gap-2">
                    <CloudLightning className="h-6 w-6 text-primary" />
                    <h2 className="text-lg font-semibold">Cloud Burst</h2>
                  </div>
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

                {/* Navigation Links */}
                <nav className="flex-1 px-6 py-4">
                  <ul className="space-y-3">
                    {[
                      { href: "/", label: "Home" },
                      { href: "/marketing/about", label: "About" },
                      { href: "/events", label: "Events" },
                      { href: "/marketing/pricing", label: "Pricing" },
                      { href: "/marketing/contact", label: "Contact" },
                    ].map((route) => (
                      <li key={route.href}>
                        <Link 
                          href={route.href}
                          className={cn(
                            "flex items-center w-full py-2 text-base hover:text-primary transition-colors",
                            pathname === route.href && "text-primary font-medium"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {route.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Auth Buttons */}
                <div className="px-6 py-4 border-t">
                  <div className="grid gap-3">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 