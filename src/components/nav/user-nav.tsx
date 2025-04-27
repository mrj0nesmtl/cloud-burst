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
import { UserCog, BellRing, CreditCard, LogOut, Settings, ActivitySquare } from "lucide-react"

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
  // Debug logging
  console.log("UserNav - User:", user?.email, "Metadata role:", user?.user_metadata?.role);
  console.log("UserNav - Profile:", profile?.email, "Profile role:", profile?.role);
  
  // Function to clear browser cache for debugging
  const clearLocalCache = () => {
    try {
      localStorage.removeItem('user_capabilities');
      console.log("Cleared user_capabilities from localStorage");
      // Force reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };
  
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
  
  // Format role for display with proper capitalization 
  const formatRole = (role?: string): string => {
    if (!role) return 'User';
    
    // Handle roles with underscores like super_admin
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Get role from profile or fallback to user metadata
  const getUserRole = (): string => {
    // First check profile
    if (profile?.role) {
      return formatRole(profile.role);
    }
    
    // Then check user metadata
    if (user?.user_metadata?.role) {
      return formatRole(user.user_metadata.role);
    }
    
    return 'User';
  };
  
  // Get display name for header
  const getDisplayName = (): string => {
    if (profile?.role && profile?.full_name) {
      return `${formatRole(profile.role)} ${profile.full_name.split(' ')[0]}`; 
    }
    
    if (profile?.full_name) {
      return profile.full_name;
    }
    
    return user?.email?.split('@')[0] || 'User Account';
  };
  
  const userRole = getUserRole();
  const displayName = getDisplayName();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || user?.email || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-semibold leading-none">
              {displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {user?.email || 'No email'}
            </p>
            <p className="text-xs font-medium text-primary mt-1">
              Role: {userRole}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* User Settings */}
        <DropdownMenuItem asChild>
          <Link href="/protected/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        {/* Debug option to clear cache */}
        <DropdownMenuItem onClick={clearLocalCache} className="flex items-center cursor-pointer">
          <ActivitySquare className="mr-2 h-4 w-4" />
          <span>Clear Cache</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Sign Out */}
        <DropdownMenuItem
          className="flex items-center cursor-pointer bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 