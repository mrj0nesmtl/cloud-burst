'use client'

import { SideNav } from '@/components/nav/side-nav'

export function AppSidebar({ variant = "default" }: { variant?: "default" | "inset" }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <SideNav />
    </div>
  )
}