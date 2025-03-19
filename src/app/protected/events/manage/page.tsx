import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Calendar, MapPin, Users, Plus, Clock, Badge as BadgeIcon, Edit, QrCode, Share, Trash2, Image } from 'lucide-react'
import { EventActions } from '@/components/events/event-actions'

export const metadata = {
  title: 'Manage Events | Cloud Burst',
  description: 'Manage your photography events',
}

interface Event {
  id: string
  name: string
  date?: string
  location?: string
  organizer_id?: string
}

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/20">Draft</Badge>
    case 'published':
      return <Badge variant="default" className="bg-green-500">Published</Badge>
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>
  }
}

// Format date to readable string
const formatDate = (dateString: string) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Define interfaces for our data
interface EventAttendee {
  event_id: string;
}

interface EventData {
  id: string;
  name: string;
  description?: string;
  location?: string;
  date?: string;
  status?: string;
  organizer_id?: string;
  user_id?: string;
  is_public?: boolean;
  type?: string;
}

interface ProcessedEvent extends EventData {
  attendeeCount: number;
}

export default async function ManageEventsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Enhanced debugging for auth
  console.log('[Manage Events Page] Auth Check:', {
    userId: user?.id,
    userEmail: user?.email,
    metadata: user?.user_metadata,
    timestamp: new Date().toISOString(),
    path: '/protected/events/manage'
  })
  
  // Get the user's profile to check their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  // Enhanced role verification logs
  console.log('[Manage Events Page] Role Check:', {
    profileRole: profile?.role,
    hasEventAccess: ['super_admin', 'admin', 'organizer', 'event_host'].includes(profile?.role || ''),
    timestamp: new Date().toISOString()
  })
  
  // Fetch events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
  
  // Enhanced error logging
  if (error) {
    console.error('[Manage Events Page] Error:', {
      error,
      userId: user?.id,
      role: profile?.role,
      timestamp: new Date().toISOString()
    })
  }
  
  // Enhanced events logging
  console.log('[Manage Events Page] Events Query:', {
    totalEvents: events?.length || 0,
    userRole: profile?.role,
    timestamp: new Date().toISOString()
  })
  
  // Post-query filtering based on role if needed
  let filteredEvents: EventData[] = events || [];
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
    filteredEvents = filteredEvents.filter(event => 
      event.organizer_id === user?.id || 
      event.user_id === user?.id || 
      event.is_public === true
    );
    
    // Log filtering results
    console.log('[Manage Events Page] Events Filtering:', {
      beforeFilter: events?.length || 0,
      afterFilter: filteredEvents.length,
      userRole: profile?.role,
      userId: user?.id,
      timestamp: new Date().toISOString()
    })
  }
  
  // Fetch event attendees in a separate query to properly count
  const { data: attendees } = await supabase
    .from('event_attendees')
    .select('event_id')
  
  // Create a map of event IDs to attendee counts
  const attendeeCounts: Record<string, number> = {};
  attendees?.forEach((attendee: EventAttendee) => {
    if (attendee.event_id) {
      attendeeCounts[attendee.event_id] = (attendeeCounts[attendee.event_id] || 0) + 1;
    }
  });
  
  // Process events data to include attendee counts
  const processedEvents: ProcessedEvent[] = filteredEvents.map(event => ({
    ...event,
    attendeeCount: event.id && attendeeCounts[event.id] ? attendeeCounts[event.id] : 0
  }));
  
  // Group events by status
  const draftEvents = processedEvents.filter(event => event.status === 'draft');
  const publishedEvents = processedEvents.filter(event => event.status === 'published');
  const completedEvents = processedEvents.filter(event => event.status === 'completed');
  const cancelledEvents = processedEvents.filter(event => event.status === 'cancelled');
  
  return (
    <div className="container py-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Manage Events</h1>
          <p className="text-muted-foreground">
            View and manage all your photography events
          </p>
        </div>
        
        <Button asChild>
          <Link href="/protected/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <BadgeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Draft Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedEvents.reduce((total, event) => total + event.attendeeCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Events list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>
            View and manage all your photography events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedEvents && processedEvents.length > 0 ? (
            <div className="space-y-4">
              {processedEvents.map((event) => (
                <div 
                  key={event.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(event.date || '')}
                        </div>
                        {event.location && (
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No events found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Error display in development */}
      {process.env.NODE_ENV === 'development' && error && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Events</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
