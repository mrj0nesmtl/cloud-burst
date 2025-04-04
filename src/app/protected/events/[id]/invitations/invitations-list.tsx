'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  Mail, 
  MoreHorizontal, 
  Send, 
  Trash, 
  Copy, 
  Clock,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Invitation = {
  id: string
  email: string
  name: string
  status: string
  created_at: string
  updated_at: string
  event_id: string
  plus_one: boolean
  token: string
}

export default function InvitationsList({ invitations }: { invitations: Invitation[] }) {
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([])
  const [isResending, setIsResending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const toggleSelectAll = () => {
    if (selectedInvitations.length === invitations.length) {
      setSelectedInvitations([])
    } else {
      setSelectedInvitations(invitations.map(inv => inv.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedInvitations.includes(id)) {
      setSelectedInvitations(selectedInvitations.filter(i => i !== id))
    } else {
      setSelectedInvitations([...selectedInvitations, id])
    }
  }

  const resendInvitations = async (ids: string[]) => {
    setIsResending(true)
    
    try {
      // Call API to resend invitations
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationIds: ids,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to resend invitations')
      }
      
      toast({
        title: 'Invitations sent',
        description: `Successfully resent ${ids.length} invitation(s).`,
      })
      
      // Update invitation status
      await supabase
        .from('invitations')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .in('id', ids)
      
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error sending invitations',
        description: 'There was an error resending the invitations.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  const deleteInvitation = async (id: string) => {
    setIsDeleting(true)
    
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      toast({
        title: 'Invitation deleted',
        description: 'The invitation has been deleted successfully.',
      })
      
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error deleting invitation',
        description: 'There was an error deleting the invitation.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setInvitationToDelete(null)
    }
  }

  const copyInvitationLink = async (token: string) => {
    const link = `${window.location.origin}/invitation/${token}`
    await navigator.clipboard.writeText(link)
    
    toast({
      title: 'Link copied',
      description: 'Invitation link copied to clipboard.',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />
      case 'opened':
        return <Eye className="h-4 w-4 text-yellow-500" />
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>
      case 'opened':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Opened</Badge>
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <div>
      {invitations.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {selectedInvitations.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resendInvitations(selectedInvitations)}
                    disabled={isResending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isResending ? 'Sending...' : 'Resend'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setInvitationToDelete('bulk')
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              {selectedInvitations.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedInvitations.length} selected
                </span>
              )}
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedInvitations.length === invitations.length && invitations.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Plus One</TableHead>
                  <TableHead className="hidden md:table-cell">Updated</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedInvitations.includes(invitation.id)}
                        onCheckedChange={() => toggleSelect(invitation.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{invitation.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {invitation.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {getStatusIcon(invitation.status)}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Last status: {invitation.status}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {getStatusBadge(invitation.status)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {invitation.plus_one ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(invitation.updated_at || invitation.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => resendInvitations([invitation.id])}>
                            <Send className="h-4 w-4 mr-2" />
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyInvitationLink(invitation.token)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setInvitationToDelete(invitation.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Mail className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No invitations found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Start by adding guest emails to send invitations
          </p>
        </div>
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {invitationToDelete === 'bulk'
                ? 'Delete selected invitations'
                : 'Delete invitation'}
            </DialogTitle>
            <DialogDescription>
              {invitationToDelete === 'bulk'
                ? `Are you sure you want to delete ${selectedInvitations.length} invitations? This action cannot be undone.`
                : 'Are you sure you want to delete this invitation? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setInvitationToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (invitationToDelete === 'bulk') {
                  // Delete multiple invitations
                  // This would be implemented similarly to the single delete function
                  // but handling multiple IDs
                  console.log('Delete bulk:', selectedInvitations)
                } else if (invitationToDelete) {
                  deleteInvitation(invitationToDelete)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 