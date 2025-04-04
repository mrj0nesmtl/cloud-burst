'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Send, 
  MoreHorizontal 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Invitation {
  id: string
  email: string
  name: string
  status: string
  created_at: string
  updated_at: string
  event_id: string
  token: string
}

interface EventInvitationsPanelProps {
  eventId: string
}

export function EventInvitationsPanel({ eventId }: EventInvitationsPanelProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchInvitations() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          
        if (error) {
          throw error
        }
        
        setInvitations(data || [])
      } catch (error) {
        console.error('Error fetching invitations:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvitations()
  }, [eventId, supabase])

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
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (e) {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Invitations</h3>
        <Link href={`/protected/events/${eventId}/invitations`}>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Manage All
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-muted/30 rounded-md p-6 text-center">
          <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-lg mb-1">No invitations yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Send invitations to guests for this event
          </p>
          <Link href={`/protected/events/${eventId}/invitations`}>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.slice(0, 5).map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invitation.name || "Guest"}</div>
                      <div className="text-sm text-muted-foreground">{invitation.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(invitation.status)}
                      <span className="ml-2">{getStatusBadge(invitation.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(invitation.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          Resend
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {invitations.length > 5 && (
            <div className="p-2 text-center border-t">
              <Link href={`/protected/events/${eventId}/invitations`}>
                <Button variant="link" size="sm">
                  View all {invitations.length} invitations
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 