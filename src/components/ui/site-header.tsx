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

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo Section - Always Visible */}
        <div className="flex shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <CloudLightning className="h-6 w-6 text-blue-500" />
            <span className="font-semibold text-lg whitespace-nowrap">Cloud Burst</span>
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on Mobile */}
        <div className="hidden md:flex md:items-center md:justify-between md:flex-1 md:px-6">
          <NavigationMenu>
            <NavigationMenuList className="space-x-2">
              <NavigationMenuItem>
                <Link href="/marketing/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/marketing/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/marketing/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button variant="outline" asChild className="whitespace-nowrap">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="whitespace-nowrap">
              <Link href="/auth/register">Get Started</Link>
            </Button>
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