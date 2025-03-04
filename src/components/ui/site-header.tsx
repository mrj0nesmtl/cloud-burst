"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CloudLightning } from "lucide-react"
import { MobileNav } from "@/components/ui/mobile-nav"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { buttonVariants } from "@/components/ui/button"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo Section - Always Visible */}
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <CloudLightning className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold text-lg whitespace-nowrap group-hover:text-primary transition-colors">Cloud Burst</span>
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:flex md:items-center md:justify-between md:flex-1 md:px-6">
          <NavigationMenu>
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <Link href="/events" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${pathname === '/events' ? 'text-primary font-medium' : ''}`}>
                    Events
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/marketing/about" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${pathname === '/marketing/about' ? 'text-primary font-medium' : ''}`}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/marketing/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${pathname === '/marketing/pricing' ? 'text-primary font-medium' : ''}`}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/marketing/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${pathname === '/marketing/contact' ? 'text-primary font-medium' : ''}`}>
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            <nav className="flex items-center space-x-2">
              <Link
                href="/auth/signin"
                className={buttonVariants({ variant: "ghost", size: "sm" }) + " hover:text-primary"}
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className={buttonVariants({ size: "sm" }) + " btn-primary"}
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation - Visible only on Mobile */}
        <div className="flex items-center space-x-4 md:hidden">
          <ModeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
} 