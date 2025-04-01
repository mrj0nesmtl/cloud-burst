"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'

// UI Components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  UserPlus, 
  Mail, 
  MoreHorizontal,
  Download,
  FileText,
  AlertCircle,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'

// Types
import { RsvpStatus } from '@/types/invitations'
import { Database } from '@/types/supabase'

type Invitation = {
  id: string
  name: string
  email: string
  status: string
  rsvp_status: RsvpStatus | null
  rsvp_date: string | null
  sent_at: string | null
  metadata: any
  plus_one_used: boolean
  plus_one_name: string | null
}

type RsvpDetail = {
  id: string
  invitation_id: string
  status: RsvpStatus
  guest_count: number
  dietary_restrictions: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface RsvpDashboardProps {
  eventId: string
}

export function RsvpDashboard({ eventId }: RsvpDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  
  // State
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [rsvps, setRsvps] = useState<RsvpDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'all'>('all')
  const [isResending, setIsResending] = useState(false)
  
  // Load invitations and RSVPs
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Fetch invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('invitations')
          .select('id, name, email, status, rsvp_status, rsvp_date, sent_at, metadata')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
        
        if (invitationsError) {
          throw invitationsError
        }
        
        // Process invitations with metadata
        const processedInvitations = invitationsData.map(invitation => ({
          ...invitation,
          plus_one_used: invitation.metadata?.plus_one_used || false,
          plus_one_name: invitation.metadata?.plus_one_name || null
        }))
        
        setInvitations(processedInvitations)
        
        // Fetch RSVP details
        const invitationIds = processedInvitations.map(inv => inv.id)
        
        if (invitationIds.length > 0) {
          const { data: rsvpsData, error: rsvpsError } = await supabase
            .from('rsvps')
            .select('*')
            .in('invitation_id', invitationIds)
          
          if (rsvpsError) {
            throw rsvpsError
          }
          
          setRsvps(rsvpsData || [])
        }
      } catch (error) {
        console.error('Error loading RSVP data:', error)
        toast({
          title: 'Error loading data',
          description: 'Failed to load RSVP information. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [eventId, supabase, toast])
  
  // Calculate RSVP statistics
  const totalInvitations = invitations.length
  const acceptedCount = invitations.filter(inv => inv.rsvp_status === 'accepted').length
  const declinedCount = invitations.filter(inv => inv.rsvp_status === 'declined').length
  const pendingCount = invitations.filter(inv => !inv.rsvp_status || inv.rsvp_status === 'pending').length
  
  // Calculate total expected guests (including plus ones)
  const totalExpectedGuests = rsvps.reduce((total, rsvp) => {
    return rsvp.status === 'accepted' ? total + rsvp.guest_count : total
  }, 0)
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'MMM d, yyyy')
  }
  
  // Get status icon
  const getStatusIcon = (status: RsvpStatus | null) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <HelpCircle className="h-4 w-4 text-yellow-500" />
    }
  }
  
  // Filter invitations
  const filteredInvitations = invitations.filter(invitation => {
    // Apply status filter
    if (statusFilter !== 'all' && invitation.rsvp_status !== statusFilter) {
      return false
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        invitation.name?.toLowerCase().includes(searchLower) ||
        invitation.email?.toLowerCase().includes(searchLower) ||
        invitation.plus_one_name?.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })
  
  // Resend invitation
  const handleResendInvitation = async (invitationId: string) => {
    setIsResending(true)
    try {
      const response = await fetch('/api/invitations/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitationId
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resend invitation')
      }
      
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been successfully resent.',
      })
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend the invitation',
        variant: 'destructive'
      })
    } finally {
      setIsResending(false)
    }
  }
  
  // Export RSVP data to CSV
  const handleExportCsv = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Status', 'RSVP Date', 'Plus One', 'Plus One Name', 'Dietary Restrictions', 'Notes']
      const rows = invitations.map(inv => {
        const rsvpData = rsvps.find(r => r.invitation_id === inv.id)
        return [
          inv.name || '',
          inv.email || '',
          inv.rsvp_status || 'pending',
          inv.rsvp_date ? format(new Date(inv.rsvp_date), 'yyyy-MM-dd') : '',
          inv.plus_one_used ? 'Yes' : 'No',
          inv.plus_one_name || '',
          rsvpData?.dietary_restrictions || '',
          rsvpData?.notes || ''
        ]
      })
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `event-${eventId}-rsvps.csv`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Export successful',
        description: `Successfully exported ${invitations.length} RSVPs to CSV.`
      })
    } catch (error) {
      console.error('Error exporting RSVPs:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export RSVP data. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RSVP Dashboard</CardTitle>
          <CardDescription>Loading RSVP data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-10 w-10 animate-spin text-primary opacity-70" />
            <p className="text-sm text-muted-foreground">Loading invitation and RSVP data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>RSVP Dashboard</CardTitle>
        <CardDescription>Manage and track event RSVPs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSVP Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Invited</p>
                <h3 className="text-3xl font-bold mt-1">{totalInvitations}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <h3 className="text-3xl font-bold mt-1 text-green-500">{acceptedCount}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Declined</p>
                <h3 className="text-3xl font-bold mt-1 text-red-500">{declinedCount}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Expected Guests</p>
                <h3 className="text-3xl font-bold mt-1">{totalExpectedGuests}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Response Progress */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Response Rate</p>
            <Progress value={(acceptedCount + declinedCount) / totalInvitations * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{((acceptedCount + declinedCount) / totalInvitations * 100).toFixed(0)}% responded</span>
              <span>{pendingCount} pending</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs 
                defaultValue="all" 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as RsvpStatus | 'all')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="declined">Declined</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleExportCsv}
              title="Export to CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* RSVP Table */}
        {filteredInvitations.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/10">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No RSVPs found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {searchTerm || statusFilter !== 'all' ? 
                'Try adjusting your filters to see more results.' : 
                'Send invitations to start tracking RSVPs.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                onClick={() => router.push(`/protected/events/${eventId}/attendees?tab=invitations`)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Date</TableHead>
                  <TableHead>Plus One</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => {
                  const rsvpData = rsvps.find(r => r.invitation_id === invitation.id)
                  
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.name}</TableCell>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(invitation.rsvp_status)}
                          <Badge variant={
                            invitation.rsvp_status === 'accepted' ? 'success' :
                            invitation.rsvp_status === 'declined' ? 'destructive' :
                            'secondary'
                          } className="ml-1">
                            {invitation.rsvp_status === 'accepted' ? 'Accepted' :
                             invitation.rsvp_status === 'declined' ? 'Declined' :
                             'Pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(invitation.rsvp_date)}
                      </TableCell>
                      <TableCell>
                        {invitation.plus_one_used ? (
                          <span title={invitation.plus_one_name || undefined}>Yes</span>
                        ) : "No"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                if (rsvpData) {
                                  // View RSVP details
                                  toast({
                                    title: "RSVP Details",
                                    description: `
                                    Status: ${rsvpData.status}
                                    Guests: ${rsvpData.guest_count}
                                    ${rsvpData.dietary_restrictions ? `Dietary: ${rsvpData.dietary_restrictions}` : ''}
                                    ${rsvpData.notes ? `Notes: ${rsvpData.notes}` : ''}
                                    `,
                                  })
                                } else {
                                  toast({
                                    title: "No RSVP Details",
                                    description: "This guest hasn't submitted RSVP details yet."
                                  })
                                }
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendInvitation(invitation.id)}
                              disabled={isResending}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Resend Invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredInvitations.length} of {invitations.length} invitations
        </p>
      </CardFooter>
    </Card>
  )
} 