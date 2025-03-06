"use client"

import { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Profile {
  id: string
  role: string
  avatar_url?: string | null
  full_name?: string | null
  [key: string]: any
}

interface UserNavProps {
  user: any // Temporarily use any to fix type issues
  profile?: any // Temporarily use any to fix type issues
  onSignOut?: () => Promise<void>
}

export function UserNav({ user, profile, onSignOut }: UserNavProps) {
  // Use profile data if available, otherwise fallback to user metadata
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const userRole = profile?.role || user?.user_metadata?.role || 'user'
  
  // Handle null user in development mode
  if (!user && process.env.NODE_ENV === 'development') {
    return (
      <Avatar>
        <AvatarFallback>DEV</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'No email'}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              Role: {userRole}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/protected/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/settings">Settings</Link>
        </DropdownMenuItem>
        {(userRole === 'super_admin' || userRole === 'admin') && (
          <DropdownMenuItem asChild>
            <Link href="/protected/admin">Admin Dashboard</Link>
          </DropdownMenuItem>
        )}
        {(userRole === 'organizer') && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/protected/events/create">Create Event</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/protected/events/manage">Manage Events</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/protected/events/invitations">Invitations</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onSignOut}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 