import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { format } from 'date-fns'

// Icons
import { 
  Calendar, 
  Users, 
  Camera, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  ArrowRight,
  CalendarDays,
  QrCode
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Types
import { EventStatus } from '@/types/events'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Manage your events and photos',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function DashboardPage() {
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/dashboard')

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) throw profileError
    if (!profile) throw new Error('Profile not found')

    const userRole = profile?.role || 'user'

    // Only redirect super admins and admins if they specifically need to be in their admin dashboard
    if ((userRole === 'super_admin' || userRole === 'admin') && 
        profile?.preferences?.defaultView === 'admin') {
      redirect('/protected/admin')
    }

    // Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        date,
        status,
        created_at
      `)
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
    
    if (eventsError) throw eventsError
    
    // Get event counts
    const totalEvents = events?.length || 0
    const activeEvents = events?.filter(e => e.status === 'published').length || 0
    const draftEvents = events?.filter(e => e.status === 'draft').length || 0
    
    // Get upcoming events (next 7 days)
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)
    
    const upcomingEvents = events?.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= now && eventDate <= nextWeek
    }) || []
    
    // Get recent events (last 3)
    const recentEvents = events?.slice(0, 3) || []
    
    // Get attendee counts for each event
    const eventIds = events?.map(event => event.id) || []
    let totalAttendees = 0
    
    if (eventIds.length > 0) {
      const { count } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
      
      totalAttendees = count || 0
    }
    
    // Get total photos
    let totalPhotos = 0
    
    if (eventIds.length > 0) {
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
      
      totalPhotos = count || 0
    }
    
    // Format date for display
    const formatEventDate = (dateString: string): string => {
      return format(new Date(dateString), 'MMM d, yyyy')
    }
    
    // Get status badge
    const getStatusBadge = (status: EventStatus) => {
      switch (status) {
        case 'draft':
          return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Draft</Badge>
        case 'published':
          return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Published</Badge>
        case 'completed':
          return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>
        case 'cancelled':
          return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>
        default:
          return null
      }
    }
    
    // Mock activities for the activity feed
    const activities = [
      {
        id: '1',
        type: 'photo',
        content: '5 new photos pending review',
        eventId: events?.[0]?.id,
        eventName: events?.[0]?.name || 'Event',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        type: 'rsvp',
        content: '3 new attendees RSVP\'d',
        eventId: events?.[0]?.id,
        eventName: events?.[0]?.name || 'Event',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
      },
      {
        id: '3',
        type: 'comment',
        content: 'New comment on event page',
        eventId: events?.[0]?.id,
        eventName: events?.[0]?.name || 'Event',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
      },
      {
        id: '4',
        type: 'system',
        content: 'Subscription renews in 12 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() // 6 hours ago
      }
    ]
    
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.full_name || profile.email || session.user.email}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {activeEvents} active, {draftEvents} drafts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendees</CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground">
                Across {totalEvents} events
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photos</CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <Camera className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPhotos}</div>
              <p className="text-xs text-muted-foreground">
                Across {totalEvents} events
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                In the next 7 days
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="mb-4 text-muted-foreground">
                      You haven't created any events yet.
                    </p>
                    <Button asChild>
                      <Link href="/protected/events/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Event
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{event.name}</h3>
                          {getStatusBadge(event.status as EventStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatEventDate(event.date)}
                        </p>
                        <div className="flex justify-between pt-2 gap-2">
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link href={`/protected/events/${event.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link href={`/protected/events/${event.id}/attendees`}>
                              Manage Attendees
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end pt-2">
                      <Button variant="link" size="sm" asChild className="flex items-center gap-1">
                        <Link href="/protected/events/manage">
                          <span>View All Events</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/protected/events/create" className="group flex flex-col space-y-2 rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <PlusCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Create Event</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Create a new event for your attendees</p>
                  </Link>
                  
                  <Link href="/protected/attendees/invitations" className="group flex flex-col space-y-2 rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Invitations</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Send and track invitations</p>
                  </Link>
                  
                  <Link href="/protected/qr-codes" className="group flex flex-col space-y-2 rounded-lg border p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <QrCode className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">QR Codes</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage event QR codes</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {activity.type === 'photo' && <Camera className="h-4 w-4" />}
                            {activity.type === 'rsvp' && <Users className="h-4 w-4" />}
                            {activity.type === 'comment' && <Calendar className="h-4 w-4" />}
                            {activity.type === 'system' && <Calendar className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">{activity.content}</p>
                          {activity.eventName && (
                            <p className="text-sm text-muted-foreground">
                              on{' '}
                              <Link href={`/protected/events/${activity.eventId}`} className="font-medium text-primary hover:underline">
                                {activity.eventName}
                              </Link>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    
    // Return error UI instead of redirecting
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Dashboard</h1>
        <p className="text-muted-foreground">Please try refreshing the page. If the problem persists, try signing out and back in.</p>
      </div>
    )
  }
}
