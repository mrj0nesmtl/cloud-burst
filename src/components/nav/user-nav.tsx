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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserCog, BellRing, CreditCard, LogOut, Settings } from "lucide-react"

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
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    
    return 'U'
  }
  
  // Format role for display
  const userRole = profile?.role ? profile.role.replace('_', ' ') : 'User'
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || user?.email || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.full_name || user?.email || 'User Account'}
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
        
        {/* User Settings */}
        <DropdownMenuItem asChild>
          <Link href="/protected/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Sign Out */}
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 flex items-center"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 