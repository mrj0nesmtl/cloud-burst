'use client'

import * as React from "react"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Users, 
  Calendar, 
  Image, 
  BarChart, 
  Settings, 
  Shield, 
  Mail,
  ActivitySquare,
  Database,
  AlertCircle,
  CalendarIcon,
  ImageIcon,
  Layers,
  MessageCircle,
  Headphones,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  submenu?: SidebarItem[]
}

export function AdminSidebar() {
  const pathname = usePathname()

  const dashboardItems: SidebarItem[] = useMemo(
    () => [
      {
        title: "Overview",
        href: "/protected/admin/dashboard",
        icon: <Home size={16} />,
      },
      {
        title: "Analytics",
        href: "/protected/admin/analytics",
        icon: <BarChart size={16} />,
      },
      {
        title: "User Management",
        href: "/protected/admin/users",
        icon: <Users size={16} />,
      },
    ],
    []
  )

  const contentItems: SidebarItem[] = useMemo(
    () => [
      {
        title: "Events",
        href: "/protected/admin/events",
        icon: <CalendarIcon className="h-4 w-4" />,
      },
      {
        title: "Photos",
        href: "/protected/admin/photos",
        icon: <ImageIcon className="h-4 w-4" />,
      },
    ],
    []
  )

  const communicationItems: SidebarItem[] = useMemo(
    () => [
      {
        title: "Contacts",
        href: "/protected/admin/contacts",
        icon: <Users size={16} />,
      },
      {
        title: "Newsletter",
        href: "/protected/admin/newsletter",
        icon: <MessageCircle className="h-4 w-4" />,
      },
    ],
    []
  )

  const systemItems: SidebarItem[] = useMemo(
    () => [
      {
        title: "Guest Diagnostics",
        href: "/protected/admin/diagnostic/guest-consistency",
        icon: <AlertCircle size={16} />,
      },
      {
        title: "Database",
        href: "/protected/admin/diagnostic",
        icon: <Database size={16} />,
      },
      {
        title: "Clear Cache",
        href: "/protected/admin/diagnostic/clear-cache",
        icon: <ActivitySquare size={16} />,
      },
    ],
    []
  )
  
  const settingsItems: SidebarItem[] = useMemo(
    () => [
      {
        title: "Settings",
        href: "/protected/admin/settings",
        icon: <Settings size={16} />,
      },
      {
        title: "Roles",
        href: "/protected/admin/roles",
        icon: <Layers size={16} />,
      },
      {
        title: "Support",
        href: "/protected/admin/support",
        icon: <Headphones size={16} />,
      },
    ],
    []
  )

  // Function to check if a menu item matches the current path
  const isActive = (href: string) => {
    // Check if href includes specific patterns like 'dashboard' or 'analytics'
    const basePathname = pathname?.split("/").slice(0, 4).join("/")
    return basePathname === href
  }

  return (
    <div className="w-full max-w-[250px] overflow-y-auto bg-background px-4 py-6 shadow-md">
      <div className="flex flex-col space-y-6">
        <div className="space-y-1">
          <Accordion type="multiple" defaultValue={["dashboard", "content", "system", "settings"]}>
            <AccordionItem value="dashboard">
              <AccordionTrigger className="font-semibold">
                Dashboard
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {dashboardItems.map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="content">
              <AccordionTrigger className="font-semibold">
                Content
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {contentItems.map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="communication">
              <AccordionTrigger className="font-semibold">
                Communication
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {communicationItems.map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="system">
              <AccordionTrigger className="font-semibold">
                System
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {systemItems.map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="settings">
              <AccordionTrigger className="font-semibold">
                Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {settingsItems.map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
} 