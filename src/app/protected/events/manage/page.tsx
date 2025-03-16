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
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
  
  // Get the user's profile to check their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  // For debugging to determine what user and role we're working with
  console.log('User ID:', user?.id);
  console.log('User Role:', profile?.role);
  
  // Changes from eq() to in() to allow for broader permissions
  // Also removed the profiles and event_attendees to simplify the query
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    
  // Log the query results for debugging
  if (error) {
    console.error('Error fetching events:', error);
  }
  
  console.log('Events found:', events?.length);
  
  // Post-query filtering based on role if needed
  let filteredEvents: EventData[] = events || [];
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
    filteredEvents = filteredEvents.filter(event => 
      event.organizer_id === user?.id || 
      event.user_id === user?.id || 
      event.is_public === true
    );
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
    <div style={{ width: '100%', padding: '24px' }}>
      {/* Header section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Manage Events</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
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
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '16px',
        marginBottom: '24px'
      }}>
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
            <div>
              {processedEvents.map((event) => (
                <div 
                  key={event.id} 
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '16px',
                    backgroundColor: 'var(--card)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        gap: '8px'
                      }}>
                        <h3 style={{ 
                          fontWeight: '600', 
                          fontSize: '16px',
                          marginBottom: '4px'
                        }}>
                          {event.name}
                        </h3>
                        {getStatusBadge(event.status || '')}
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '14px',
                        color: 'var(--muted-foreground)',
                        marginBottom: '8px'
                      }}>
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(event.date || '')}</span>
                      </div>
                      
                      {event.location && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          fontSize: '14px',
                          color: 'var(--muted-foreground)',
                          marginBottom: '8px'
                        }}>
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.type && (
                        <div style={{ 
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}>
                          {event.type}
                        </div>
                      )}
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '14px',
                        color: 'var(--muted-foreground)'
                      }}>
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{event.attendeeCount} attendees</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '12px 16px',
                    backgroundColor: 'var(--muted)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <EventActions eventId={event.id} organizerId={event.organizer_id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '24px',
              textAlign: 'center'
            }}>
              <Calendar style={{ 
                height: '48px', 
                width: '48px', 
                margin: '0 auto', 
                marginBottom: '16px',
                color: 'var(--muted-foreground)'
              }} />
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                No events found
              </h3>
              <p style={{ 
                color: 'var(--muted-foreground)', 
                maxWidth: '400px',
                margin: '0 auto',
                marginBottom: '24px'
              }}>
                You don't have any events yet. Create your first event to get started.
              </p>
              <Button asChild>
                <Link href="/protected/events/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Error display in development */}
      {process.env.NODE_ENV === 'development' && error && (
        <Card style={{ borderColor: 'var(--red-500)', marginTop: '24px' }}>
          <CardHeader className="pb-2">
            <CardTitle style={{ color: 'var(--red-500)' }}>Error Loading Events</CardTitle>
          </CardHeader>
          <CardContent>
            <pre style={{ 
              fontSize: '12px', 
              overflow: 'auto' 
            }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
