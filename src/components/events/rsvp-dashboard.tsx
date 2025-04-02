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
  Search,
  MessageCircle
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'

// Types
import { RsvpStatus } from '@/types/invitations'
import { Database } from '@/types/supabase'

type Invitation = {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  rsvp_status: RsvpStatus | null;
  rsvp_date: string | null;
  sent_at: string | null;
  metadata: {
    plus_one_used?: boolean;
    plus_one_name?: string | null;
    [key: string]: any;
  } | null;
  plus_one_used: boolean;
  plus_one_name: string | null;
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
    // Ensure loading is set to true at the start of data fetch
    setLoading(true);
    
    async function loadData() {
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
          plus_one_used: invitation.metadata && typeof invitation.metadata === 'object' && !Array.isArray(invitation.metadata)
            ? (invitation.metadata as Record<string, any>).plus_one_used || false 
            : false,
          plus_one_name: invitation.metadata && typeof invitation.metadata === 'object' && !Array.isArray(invitation.metadata)
            ? (invitation.metadata as Record<string, any>).plus_one_name || null 
            : null
        }))
        
        setInvitations(processedInvitations as Invitation[])
        
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
          
          setRsvps(rsvpsData ? rsvpsData.map(rsvp => ({
            ...rsvp,
            status: rsvp.status as RsvpStatus
          })) : [])
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
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            Loading RSVP Dashboard
          </CardTitle>
          <CardDescription>Please wait while we fetch the RSVP data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4 w-full max-w-md">
            <Progress value={45} className="w-full" />
            <p className="text-sm text-muted-foreground">Loading invitation and RSVP data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card style={{
      width: '100%',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <CardHeader style={{
        padding: '0.75rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <CardTitle style={{
          fontSize: '1rem', 
          display: 'flex', 
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <MessageCircle className="h-4 w-4 text-primary" />
          RSVP Dashboard
        </CardTitle>
        <CardDescription style={{
          fontSize: '0.75rem'
        }}>
          Manage and track event RSVPs
        </CardDescription>
      </CardHeader>
      <CardContent style={{
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* RSVP Summary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          width: '100%'
        }}>
          <Card style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            boxShadow: 'none'
          }}>
            <CardContent style={{ 
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--muted-foreground)',
                marginBottom: '0.25rem'
              }}>Total Invited</p>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>{totalInvitations}</h3>
            </CardContent>
          </Card>
          
          <Card style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            boxShadow: 'none'
          }}>
            <CardContent style={{ 
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--muted-foreground)',
                marginBottom: '0.25rem'
              }}>Accepted</p>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: 'var(--green-500, #10b981)'
              }}>{acceptedCount}</h3>
            </CardContent>
          </Card>
          
          <Card style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            boxShadow: 'none'
          }}>
            <CardContent style={{ 
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--muted-foreground)',
                marginBottom: '0.25rem'
              }}>Declined</p>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: 'var(--red-500, #ef4444)'
              }}>{declinedCount}</h3>
            </CardContent>
          </Card>
          
          <Card style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            boxShadow: 'none'
          }}>
            <CardContent style={{ 
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--muted-foreground)',
                marginBottom: '0.25rem'
              }}>Expected Guests</p>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0
              }}>{totalExpectedGuests}</h3>
            </CardContent>
          </Card>
        </div>
        
        {/* Response Progress */}
        <Card style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card-background, var(--background))',
          boxShadow: 'none',
          padding: '0.75rem'
        }}>
          <p style={{ 
            fontSize: '0.75rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>Response Rate</p>
          <Progress 
            value={(acceptedCount + declinedCount) / totalInvitations * 100} 
            className="h-2" 
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--muted-foreground)'
            }}>{((acceptedCount + declinedCount) / totalInvitations * 100).toFixed(0)}% responded</span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--muted-foreground)'
            }}>{pendingCount} pending</span>
          </div>
        </Card>
        
        {/* Filters and Search */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%'
          }}>
            <div style={{
              position: 'relative',
              width: '100%'
            }}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '0.875rem',
                width: '0.875rem',
                color: 'var(--muted-foreground)'
              }} />
              <Input 
                placeholder="Search by name or email..." 
                style={{
                  paddingLeft: '2.25rem',
                  width: '100%',
                  height: '2.25rem',
                  fontSize: '0.75rem'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: '0.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: 1
              }}>
                <Filter style={{
                  height: '0.875rem',
                  width: '0.875rem',
                  color: 'var(--muted-foreground)'
                }} />
                <Tabs 
                  defaultValue="all" 
                  value={statusFilter} 
                  onValueChange={(value) => setStatusFilter(value as RsvpStatus | 'all')}
                  style={{
                    width: '100%'
                  }}
                >
                  <TabsList style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    padding: '0.25rem',
                    backgroundColor: 'var(--muted)'
                  }}>
                    <TabsTrigger value="all" style={{fontSize: '0.7rem'}}>All</TabsTrigger>
                    <TabsTrigger value="accepted" style={{fontSize: '0.7rem'}}>Accepted</TabsTrigger>
                    <TabsTrigger value="declined" style={{fontSize: '0.7rem'}}>Declined</TabsTrigger>
                    <TabsTrigger value="pending" style={{fontSize: '0.7rem'}}>Pending</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleExportCsv}
                title="Export to CSV"
                style={{
                  height: '2.25rem',
                  width: '2.25rem',
                  minWidth: '2.25rem',
                  padding: '0'
                }}
              >
                <Download style={{
                  height: '0.875rem',
                  width: '0.875rem'
                }} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* RSVP Table */}
        {filteredInvitations.length === 0 ? (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            padding: '2rem 1rem',
            textAlign: 'center',
            backgroundColor: 'var(--muted-background, var(--muted))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle style={{
              height: '2rem',
              width: '2rem',
              color: 'var(--muted-foreground)',
              opacity: 0.5
            }} />
            <div>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.25rem'
              }}>No RSVPs found</h3>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
                maxWidth: '20rem',
                margin: '0 auto 1rem'
              }}>
                {searchTerm || statusFilter !== 'all' ? 
                  'Try adjusting your filters to see more results.' : 
                  'Send invitations to start tracking RSVPs.'}
              </p>
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                onClick={() => router.push(`/protected/events/${eventId}/attendees?tab=invitations`)}
                size="sm"
                style={{
                  fontSize: '0.75rem',
                  height: '2rem'
                }}
              >
                <UserPlus style={{
                  height: '0.875rem',
                  width: '0.875rem',
                  marginRight: '0.375rem'
                }} />
                Send Invitations
              </Button>
            )}
          </div>
        ) : (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            overflow: 'hidden',
            width: '100%'
          }}>
            <div style={{
              overflowX: 'auto',
              width: '100%'
            }}>
              <Table style={{
                width: '100%'
              }}>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{fontSize: '0.7rem', fontWeight: '600'}}>Guest</TableHead>
                    <TableHead style={{fontSize: '0.7rem', fontWeight: '600'}}>Email</TableHead>
                    <TableHead style={{fontSize: '0.7rem', fontWeight: '600'}}>Status</TableHead>
                    <TableHead style={{fontSize: '0.7rem', fontWeight: '600'}}>Response Date</TableHead>
                    <TableHead style={{fontSize: '0.7rem', fontWeight: '600'}}>Plus One</TableHead>
                    <TableHead style={{fontSize: '0.7rem', fontWeight: '600', textAlign: 'right'}}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.map((invitation) => {
                    const rsvpData = rsvps.find(r => r.invitation_id === invitation.id)
                    
                    return (
                      <TableRow key={invitation.id}>
                        <TableCell style={{
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          padding: '0.5rem 1rem'
                        }}>{invitation.name}</TableCell>
                        <TableCell style={{
                          fontSize: '0.75rem',
                          padding: '0.5rem 1rem'
                        }}>{invitation.email}</TableCell>
                        <TableCell style={{
                          padding: '0.5rem 1rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {getStatusIcon(invitation.rsvp_status)}
                            <Badge variant={
                              invitation.rsvp_status === 'accepted' ? 'success' :
                              invitation.rsvp_status === 'declined' ? 'destructive' :
                              'secondary'
                            } style={{
                              fontSize: '0.65rem',
                              padding: '0.125rem 0.375rem'
                            }}>
                              {invitation.rsvp_status === 'accepted' ? 'Accepted' :
                               invitation.rsvp_status === 'declined' ? 'Declined' :
                               'Pending'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell style={{
                          fontSize: '0.75rem',
                          padding: '0.5rem 1rem'
                        }}>
                          {formatDate(invitation.rsvp_date)}
                        </TableCell>
                        <TableCell style={{
                          fontSize: '0.75rem',
                          padding: '0.5rem 1rem'
                        }}>
                          {invitation.plus_one_used ? (
                            <span title={invitation.plus_one_name || undefined}>Yes</span>
                          ) : "No"}
                        </TableCell>
                        <TableCell style={{
                          textAlign: 'right',
                          padding: '0.5rem 1rem'
                        }}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" style={{
                                height: '1.75rem',
                                width: '1.75rem'
                              }}>
                                <MoreHorizontal style={{
                                  height: '0.875rem',
                                  width: '0.875rem'
                                }} />
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
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 1rem'
                                }}
                              >
                                <FileText style={{
                                  height: '0.875rem',
                                  width: '0.875rem',
                                  marginRight: '0.5rem'
                                }} />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResendInvitation(invitation.id)}
                                disabled={isResending}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 1rem'
                                }}
                              >
                                <Mail style={{
                                  height: '0.875rem',
                                  width: '0.875rem',
                                  marginRight: '0.5rem'
                                }} />
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
          </div>
        )}
      </CardContent>
      <CardFooter style={{
        padding: '0.75rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--muted-foreground)'
        }}>
          Showing {filteredInvitations.length} of {invitations.length} invitations
        </p>
      </CardFooter>
    </Card>
  )
} 