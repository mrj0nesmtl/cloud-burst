import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserEventsWithCounts } from '@/lib/supabase/events.server'
import { CalendarDays, Users, Image, Calendar, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { EventWithCounts } from '@/types/events'

export const metadata: Metadata = {
  title: 'Overview | Cloud Burst',
  description: 'Event overview and statistics',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OverviewPage() {
  // Fetch events with attendee and photo counts
  const events = await getUserEventsWithCounts()
  
  // Group events by status
  const draftEvents = events.filter(event => event.status === 'draft')
  const publishedEvents = events.filter(event => event.status === 'published')
  const completedEvents = events.filter(event => event.status === 'completed')
  const cancelledEvents = events.filter(event => event.status === 'cancelled')
  
  // Calculate statistics
  const totalEvents = events.length
  const totalAttendees = events.reduce((sum, event) => sum + event.attendees_count, 0)
  const totalPhotos = events.reduce((sum, event) => sum + event.photos_count, 0)
  
  // Get upcoming events (next 7 days)
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= now && eventDate <= nextWeek && event.status === 'published'
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Overview</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Dashboard overview and event statistics
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {publishedEvents.length} published, {draftEvents.length} drafts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              In the next 7 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Suspense fallback={<UpcomingEventsSkeleton />}>
            <UpcomingEvents events={upcomingEvents} />
          </Suspense>
        </TabsContent>
        <TabsContent value="status" className="space-y-4">
          <Suspense fallback={<StatusBreakdownSkeleton />}>
            <StatusBreakdown 
              draft={draftEvents.length}
              published={publishedEvents.length}
              completed={completedEvents.length}
              cancelled={cancelledEvents.length}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <Suspense fallback={<CalendarViewSkeleton />}>
            <CalendarView events={events} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Upcoming events component
interface UpcomingEventsProps {
  events: EventWithCounts[];
}

function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-4">No upcoming events in the next 7 days.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle>
                  <Link href={`/protected/events/${event.id}`} className="hover:text-blue-500 transition-colors">
                    {event.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <CalendarDays className="mr-1 h-3.5 w-3.5" />
                  {formatDate(event.date)}
                </CardDescription>
              </div>
              <Badge className="bg-green-500">Published</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-sm">
                <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.attendees_count}</span>
                <span className="text-muted-foreground ml-1">attendees</span>
              </div>
              <div className="flex items-center text-sm">
                <Image className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.photos_count}</span>
                <span className="text-muted-foreground ml-1">photos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Status breakdown component
interface StatusBreakdownProps {
  draft: number;
  published: number;
  completed: number;
  cancelled: number;
}

function StatusBreakdown({ draft, published, completed, cancelled }: StatusBreakdownProps) {
  const total = draft + published + completed + cancelled
  
  if (total === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-4">No events found.</p>
        </CardContent>
      </Card>
    )
  }
  
  const calculatePercentage = (value: number): number => {
    return Math.round((value / total) * 100)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Status Breakdown</CardTitle>
        <CardDescription>Distribution of events by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                <span className="text-sm font-medium">Published</span>
              </div>
              <span className="text-sm text-muted-foreground">{published} ({calculatePercentage(published)}%)</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${calculatePercentage(published)}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-gray-400 mr-2" />
                <span className="text-sm font-medium">Draft</span>
              </div>
              <span className="text-sm text-muted-foreground">{draft} ({calculatePercentage(draft)}%)</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full" 
                style={{ width: `${calculatePercentage(draft)}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm text-muted-foreground">{completed} ({calculatePercentage(completed)}%)</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${calculatePercentage(completed)}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                <span className="text-sm font-medium">Cancelled</span>
              </div>
              <span className="text-sm text-muted-foreground">{cancelled} ({calculatePercentage(cancelled)}%)</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full" 
                style={{ width: `${calculatePercentage(cancelled)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Calendar view component (simplified for now)
interface CalendarViewProps {
  events: EventWithCounts[];
}

function CalendarView({ events }: CalendarViewProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-4">No events found.</p>
        </CardContent>
      </Card>
    )
  }
  
  // Group events by month
  const eventsByMonth: Record<string, EventWithCounts[]> = {}
  
  events.forEach(event => {
    const date = new Date(event.date)
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    
    if (!eventsByMonth[monthYear]) {
      eventsByMonth[monthYear] = []
    }
    
    eventsByMonth[monthYear].push(event)
  })
  
  return (
    <div className="space-y-6">
      {Object.entries(eventsByMonth).map(([monthYear, monthEvents]) => (
        <Card key={monthYear}>
          <CardHeader>
            <CardTitle>{monthYear}</CardTitle>
            <CardDescription>{monthEvents.length} events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthEvents.map(event => (
                <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="flex flex-col items-center justify-center bg-muted rounded-md p-2 min-w-[60px] text-center">
                    <span className="text-sm font-medium">
                      {new Date(event.date).toLocaleString('default', { day: 'numeric' })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleString('default', { weekday: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link href={`/protected/events/${event.id}`} className="font-medium hover:text-blue-500 transition-colors">
                        {event.name}
                      </Link>
                      {event.status === 'published' && <Badge className="bg-green-500">Published</Badge>}
                      {event.status === 'draft' && <Badge variant="outline">Draft</Badge>}
                      {event.status === 'completed' && <Badge className="bg-blue-500">Completed</Badge>}
                      {event.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        {event.attendees_count}
                      </div>
                      <div className="flex items-center">
                        <Image className="mr-1 h-3.5 w-3.5" />
                        {event.photos_count}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Skeleton loaders
function UpcomingEventsSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StatusBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
              </div>
              <div className="h-2 bg-muted rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CalendarViewSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-start gap-4 pb-4 border-b">
                  <div className="h-12 w-12 bg-muted rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-muted rounded w-1/12 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/12 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 