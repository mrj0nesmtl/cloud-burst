'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StaffRoleBadge } from '@/components/ui/staff-role-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { UsersIcon, UserPlusIcon, Mail, UserCheck, UserMinus, CalendarClock, ChevronRight } from 'lucide-react'
import { StaffInvitationForm } from './staff-invitation-form'
import { formatDistanceToNow } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type StaffMember = {
  id: string
  user_id: string
  event_id: string
  role: string
  status: string
  created_at: string
  user: {
    email: string
    name: string
    avatar_url: string | null
  } | null
}

type PendingInvitation = {
  id: string
  email: string
  name: string | null
  event_id: string
  status: string
  role_type: string
  created_at: string
  sent_at: string
}

interface StaffManagementProps {
  eventId: string
  staffType?: 'internal' | 'external'
}

export function StaffManagement({ eventId, staffType = 'internal' }: StaffManagementProps) {
  const [activeTab, setActiveTab] = useState('active')
  const [activeStaff, setActiveStaff] = useState<StaffMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [staffToRemove, setStaffToRemove] = useState<StaffMember | null>(null)
  const [roleFilter, setRoleFilter] = useState(staffType === 'internal' ? 'event_staff' : 'contractor')
  
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    fetchStaffData()
  }, [eventId])
  
  async function fetchStaffData() {
    setIsLoading(true)
    
    try {
      // Define role types based on staff type
      const roleTypes = staffType === 'internal' 
        ? ['event_host', 'event_staff'] 
        : ['contractor', 'photographer', 'technician', 'marketing']
      
      // Fetch active staff with role filter
      const { data: staffData, error: staffError } = await supabase
        .from('event_staff')
        .select<string, StaffMember>(`
          id, user_id, event_id, role, status, created_at,
          user:user_id (email, name, avatar_url)
        `)
        .eq('event_id', eventId)
        .eq('status', 'active')
        .in('role', roleTypes)
        .order('created_at', { ascending: false })
        
      if (staffError) throw staffError
      
      setActiveStaff(staffData || [])
      
      // Fetch pending invitations with role filter
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('id, email, name, event_id, status, role_type, created_at, sent_at')
        .eq('event_id', eventId)
        .eq('status', 'sent')
        .in('role_type', roleTypes)
        .order('created_at', { ascending: false })
        
      if (invitationError) throw invitationError
      
      setPendingInvitations(invitationData || [])
    } catch (error) {
      console.error('Error fetching staff data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load staff data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  async function handleRemoveStaff(staffMember: StaffMember) {
    try {
      // Remove from event_staff
      const { error: removeError } = await supabase
        .from('event_staff')
        .update({ status: 'removed' })
        .eq('id', staffMember.id)
      
      if (removeError) throw removeError
      
      // Remove their gallery permissions
      const { error: permissionsError } = await supabase
        .from('gallery_permissions')
        .delete()
        .match({ 
          event_id: eventId,
          user_id: staffMember.user_id
        })
      
      if (permissionsError) throw permissionsError
      
      toast({
        title: 'Staff member removed',
        description: `${staffMember.user?.name || staffMember.user?.email || 'Staff member'} has been removed from this event.`
      })
      
      // Refresh data
      fetchStaffData()
      
    } catch (error) {
      console.error('Error removing staff:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove staff member. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  async function handleCancelInvitation(invitation: PendingInvitation) {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'canceled' })
        .eq('id', invitation.id)
      
      if (error) throw error
      
      toast({
        title: 'Invitation canceled',
        description: `Invitation to ${invitation.email} has been canceled.`
      })
      
      // Refresh invitations
      fetchStaffData()
      
    } catch (error) {
      console.error('Error canceling invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  async function handleResendInvitation(invitation: PendingInvitation) {
    try {
      // Update sent_at timestamp
      const { error } = await supabase
        .from('invitations')
        .update({ 
          sent_at: new Date().toISOString(),
          // Extend expiration date by 7 days from now
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', invitation.id)
      
      if (error) throw error
      
      // This would trigger the email sending logic on the server
      await fetch('/api/invitations/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_id: invitation.id })
      })
      
      toast({
        title: 'Invitation resent',
        description: `Invitation has been resent to ${invitation.email}.`
      })
      
      // Refresh invitations
      fetchStaffData()
      
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to resend invitation. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  function getRoleLabel(role: string) {
    return <StaffRoleBadge role={role} size="md" />
  }
  
  function getInitials(name: string | null | undefined, email: string | null | undefined) {
    if (name && name.length > 0) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    
    if (email && email.length > 0) {
      return email[0].toUpperCase()
    }
    
    return 'U'
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Event Staff</h2>
          <p className="text-muted-foreground">
            Manage staff members and pending invitations for this event
          </p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Invite {staffType === 'internal' ? 'Staff' : 'Contractor'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Invite {staffType === 'internal' ? 'Staff Member' : 'Contractor'}
              </DialogTitle>
              <DialogDescription>
                {staffType === 'internal' 
                  ? 'Add team members to help manage this event'
                  : 'Add external contractors such as photographers or technical support'}
              </DialogDescription>
            </DialogHeader>
            
            <StaffInvitationForm 
              eventId={eventId} 
              staffType={staffType}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {staffType === 'external' && (
        <div className="mb-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contractor">All Contractors</SelectItem>
              <SelectItem value="photographer">Photographers</SelectItem>
              <SelectItem value="technician">Tech Support</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            <UserCheck className="h-4 w-4 mr-2" />
            Active Staff
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Mail className="h-4 w-4 mr-2" />
            Pending Invitations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading staff data...</div>
          ) : activeStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UsersIcon className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>No active staff members yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Invite Staff
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeStaff.map((staff) => (
                <Card key={staff.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={staff.user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(staff.user?.name, staff.user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.user?.name || 'Unnamed Staff'}</p>
                          <p className="text-sm text-muted-foreground">{staff.user?.email}</p>
                          <div className="mt-1">
                            {getRoleLabel(staff.role)}
                          </div>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {staff.user?.name || staff.user?.email} from this event?
                              They will lose access to manage this event.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleRemoveStaff(staff)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8">Loading invitations...</div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>No pending invitations</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Invite Staff
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingInvitations.map((invitation) => (
                <Card key={invitation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(invitation.name, invitation.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{invitation.name || invitation.email}</p>
                          <p className="text-sm text-muted-foreground">{invitation.email}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            {getRoleLabel(invitation.role_type)}
                            <span className="text-xs text-muted-foreground flex items-center">
                              <CalendarClock className="h-3 w-3 mr-1" />
                              Sent {formatDistanceToNow(new Date(invitation.sent_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResendInvitation(invitation)}
                        >
                          Resend
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelInvitation(invitation)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 