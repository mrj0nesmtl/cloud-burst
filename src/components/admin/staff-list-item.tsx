'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StaffRoleBadge } from '@/components/ui/staff-role-badge'
import { Card, CardContent } from '@/components/ui/card'
import { UserMinus, Mail, MoreHorizontal } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface StaffMember {
  id: string
  user_id?: string
  event_id: string
  role: string
  status?: string
  created_at: string
  staff_type?: 'internal' | 'external'
  user?: {
    email: string
    name?: string
    avatar_url?: string | null
  } | null
  // For pending invitations
  email?: string
  name?: string
}

interface StaffListItemProps {
  staff: StaffMember
  isPending?: boolean
  onRemove?: (staff: StaffMember) => void
  onResend?: (staff: StaffMember) => void
}

export function StaffListItem({ 
  staff, 
  isPending = false,
  onRemove,
  onResend 
}: StaffListItemProps) {
  // Get name and email from either staff.user or directly from staff
  const name = staff.user?.name || staff.name || 'Unnamed Staff'
  const email = staff.user?.email || staff.email || ''
  const avatarUrl = staff.user?.avatar_url || undefined
  
  // Create initials from name or email
  const getInitials = () => {
    if (name && name !== 'Unnamed Staff') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    
    if (email && email.length > 0) {
      return email[0].toUpperCase()
    }
    
    return 'U'
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <p className="font-medium leading-none">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <StaffRoleBadge role={staff.role} size="sm" />
                
                {isPending && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Pending
                  </span>
                )}
                
                {staff.staff_type === 'external' && (
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    External
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {isPending && onResend && (
                <DropdownMenuItem onClick={() => onResend(staff)}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Resend Invitation</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onRemove && (
                <DropdownMenuItem 
                  onClick={() => onRemove(staff)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  <span>{isPending ? 'Cancel Invitation' : 'Remove Staff'}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
} 