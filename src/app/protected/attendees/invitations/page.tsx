import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Mail, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manage Invitations | Cloud Burst',
  description: 'Manage invitations for your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function ManageInvitationsPage() {
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/attendees/invitations')

    // Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        date,
        status
      `)
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
    
    if (eventsError) throw eventsError
    
    // Get all attendees for user's events
    const eventIds = events?.map(event => event.id) || []
    
    let attendees = []
    
    if (eventIds.length > 0) {
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('event_attendees')
        .select(`
          id,
          event_id,
          name,
          email,
          status,
          created_at,
          updated_at
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
      
      if (attendeesError) throw attendeesError
      
      // Combine attendees with event data
      attendees = (attendeesData || []).map(attendee => {
        const event = events?.find(e => e.id === attendee.event_id)
        return {
          ...attendee,
          event_name: event?.name || 'Unknown Event',
          event_date: event?.date || '',
          event_status: event?.status || 'unknown'
        }
      })
    }
    
    // Group attendees by status
    const pendingAttendees = attendees.filter(a => a.status === 'invited')
    const confirmedAttendees = attendees.filter(a => a.status === 'confirmed')
    const attendedAttendees = attendees.filter(a => a.status === 'attended')
    const declinedAttendees = attendees.filter(a => a.status === 'declined')
    
    // Get counts by event
    const eventAttendeeCount = eventIds.reduce((acc, eventId) => {
      const eventAttendees = attendees.filter(a => a.event_id === eventId)
      acc[eventId] = {
        total: eventAttendees.length,
        invited: eventAttendees.filter(a => a.status === 'invited').length,
        confirmed: eventAttendees.filter(a => a.status === 'confirmed').length,
        attended: eventAttendees.filter(a => a.status === 'attended').length,
        declined: eventAttendees.filter(a => a.status === 'declined').length,
      }
      return acc
    }, {})
    
    // Format date for display
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    
    // Get status badge
    const getStatusBadge = (status) => {
      switch (status) {
        case 'invited':
          return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
        case 'confirmed':
          return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Confirmed</Badge>
        case 'attended':
          return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Attended</Badge>
        case 'declined':
          return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Declined</Badge>
        default:
          return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Unknown</Badge>
      }
    }
    
    return (
      <div className="container px-0 py-0 max-w-full">
        <div className="flex flex-col space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Manage Invitations</h1>
            <p className="text-muted-foreground">
              Track and manage invitations for all your events
            </p>
          </div>
        </div>
        
        {attendees.length === 0 ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>No Invitations Found</CardTitle>
              <CardDescription>
                You haven't sent any invitations yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Mail className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-6">
                Create an event and send invitations to your attendees.
              </p>
              <Button asChild>
                <Link href="/protected/events/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {events?.length || 0} events
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingAttendees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((pendingAttendees.length / attendees.length) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{confirmedAttendees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((confirmedAttendees.length / attendees.length) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Declined</CardTitle>
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <XCircle className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{declinedAttendees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((declinedAttendees.length / attendees.length) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All Invitations ({attendees.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingAttendees.length})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({confirmedAttendees.length})</TabsTrigger>
                <TabsTrigger value="events">By Event ({events?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>All Invitations</CardTitle>
                    <CardDescription>
                      View all invitations across all events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="px-4 py-3 text-left font-medium">Name</th>
                              <th className="px-4 py-3 text-left font-medium">Email</th>
                              <th className="px-4 py-3 text-left font-medium">Event</th>
                              <th className="px-4 py-3 text-left font-medium">Status</th>
                              <th className="px-4 py-3 text-left font-medium">Invited</th>
                              <th className="px-4 py-3 text-left font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendees.map(attendee => (
                              <tr key={attendee.id} className="border-b">
                                <td className="px-4 py-3">{attendee.name}</td>
                                <td className="px-4 py-3">{attendee.email}</td>
                                <td className="px-4 py-3">{attendee.event_name}</td>
                                <td className="px-4 py-3">{getStatusBadge(attendee.status)}</td>
                                <td className="px-4 py-3">{formatDate(attendee.created_at)}</td>
                                <td className="px-4 py-3">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/protected/events/${attendee.event_id}/attendees`}>
                                      Manage
                                    </Link>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>
                      View invitations that are still pending response
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingAttendees.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No pending invitations found.</p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Event</th>
                                <th className="px-4 py-3 text-left font-medium">Invited</th>
                                <th className="px-4 py-3 text-left font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingAttendees.map(attendee => (
                                <tr key={attendee.id} className="border-b">
                                  <td className="px-4 py-3">{attendee.name}</td>
                                  <td className="px-4 py-3">{attendee.email}</td>
                                  <td className="px-4 py-3">{attendee.event_name}</td>
                                  <td className="px-4 py-3">{formatDate(attendee.created_at)}</td>
                                  <td className="px-4 py-3">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={`/protected/events/${attendee.event_id}/attendees`}>
                                        Manage
                                      </Link>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="confirmed" className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Confirmed Invitations</CardTitle>
                    <CardDescription>
                      View invitations that have been confirmed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {confirmedAttendees.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No confirmed invitations found.</p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Event</th>
                                <th className="px-4 py-3 text-left font-medium">Confirmed</th>
                                <th className="px-4 py-3 text-left font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {confirmedAttendees.map(attendee => (
                                <tr key={attendee.id} className="border-b">
                                  <td className="px-4 py-3">{attendee.name}</td>
                                  <td className="px-4 py-3">{attendee.email}</td>
                                  <td className="px-4 py-3">{attendee.event_name}</td>
                                  <td className="px-4 py-3">{formatDate(attendee.updated_at)}</td>
                                  <td className="px-4 py-3">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={`/protected/events/${attendee.event_id}/attendees`}>
                                        Manage
                                      </Link>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="events" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events?.map(event => {
                    const counts = eventAttendeeCount[event.id] || { total: 0, invited: 0, confirmed: 0, attended: 0, declined: 0 }
                    return (
                      <Card key={event.id}>
                        <CardHeader>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription>
                            {formatDate(event.date)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Total Invitations:</span>
                              <span className="font-medium">{counts.total}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Pending:</span>
                              <span className="font-medium">{counts.invited}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Confirmed:</span>
                              <span className="font-medium">{counts.confirmed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Attended:</span>
                              <span className="font-medium">{counts.attended}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Declined:</span>
                              <span className="font-medium">{counts.declined}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" asChild>
                            <Link href={`/protected/events/${event.id}/attendees`}>
                              Manage Attendees
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error loading invitations page:', error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Invitations</h1>
          <p className="text-muted-foreground">
            There was an error loading your invitations. Please try again later.
          </p>
        </div>
      </div>
    )
  }
} 