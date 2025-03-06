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
  X
} from "lucide-react"

const routes = [
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

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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
      <SheetContent side="left" className="p-0 mobile-menu" data-mobile-menu>
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
          <nav className="flex-1 px-6 py-4">
            <ul className="space-y-3">
              {routes.map((route) => (
                <li key={route.href} className="mobile-menu-item reveal-on-scroll">
                  <Link 
                    href={route.href}
                    className={cn(
                      "flex items-center w-full py-2 text-base hover:text-primary transition-colors",
                      pathname === route.href && "text-primary font-medium"
                    )}
                  >
                    <route.icon className="mr-3 h-5 w-5" />
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Links */}
          <div className="px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Follow us</p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="px-6 py-4 border-t">
            <div className="grid gap-3">
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/login" className="mobile-menu-item">
                  Sign in
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/auth/register" className="mobile-menu-item">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 