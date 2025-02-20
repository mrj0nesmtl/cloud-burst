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
} from "@/components/ui/sheet"
import { 
  Menu, 
  Home,
  Info,
  CreditCard,
  Mail,
  Github,
  Twitter,
  CloudLightning
} from "lucide-react"

const routes = [
  {
    href: "/",
    label: "Home",
    icon: Home
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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">
          Navigation Menu
        </SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <CloudLightning className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-semibold">Cloud Burst</h2>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-4">
            <ul className="space-y-2">
              {routes.map((route) => (
                <li key={route.href}>
                  <Link 
                    href={route.href}
                    className={cn(
                      "flex items-center w-full py-2 text-lg hover:text-blue-500 transition-colors",
                      pathname === route.href && "text-blue-500 font-medium"
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
            <div className="flex justify-center space-x-6">
              <Link 
                href="https://github.com/cloudburst" 
                target="_blank"
                className="hover:text-blue-500 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="https://twitter.com/cloudburst" 
                target="_blank"
                className="hover:text-blue-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="px-6 py-4 border-t space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 