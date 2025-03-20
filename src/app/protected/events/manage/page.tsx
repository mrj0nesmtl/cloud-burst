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
  
  // Get the user's profile to check their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  // Fetch events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
  
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
    <div style={{ 
      width: '100%', 
      padding: '1.5rem 1rem',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem' 
    }}>
      {/* Header section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            lineHeight: '1.2'
          }}>
            Manage Events
          </h1>
          <p style={{ 
            color: 'var(--muted-foreground)', 
            fontSize: '0.9rem'
          }}>
            View and manage all your photography events
          </p>
        </div>
        
        <Button asChild style={{
          height: '2.5rem',
          whiteSpace: 'nowrap'
        }}>
          <Link href="/protected/events/create">
            <Plus style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
            Create Event
          </Link>
        </Button>
      </div>
      
      {/* Stats cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1rem',
      }}>
        <Card style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <CardHeader style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem 1rem 0.5rem'
          }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>Total Events</CardTitle>
            <Calendar style={{ height: '1rem', width: '1rem', color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent style={{ padding: '0 1rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{processedEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <CardHeader style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem 1rem 0.5rem'
          }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>Active Events</CardTitle>
            <BadgeIcon style={{ height: '1rem', width: '1rem', color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent style={{ padding: '0 1rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{publishedEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <CardHeader style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem 1rem 0.5rem'
          }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>Draft Events</CardTitle>
            <Clock style={{ height: '1rem', width: '1rem', color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent style={{ padding: '0 1rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{draftEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <CardHeader style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1rem 1rem 0.5rem'
          }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>Total Attendees</CardTitle>
            <Users style={{ height: '1rem', width: '1rem', color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent style={{ padding: '0 1rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {processedEvents.reduce((total, event) => total + event.attendeeCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Events list */}
      <Card style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
        <CardHeader style={{ padding: '1.25rem' }}>
          <CardTitle style={{ fontSize: '1.25rem', fontWeight: '600' }}>Your Events</CardTitle>
          <CardDescription style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>
            View and manage all your photography events
          </CardDescription>
        </CardHeader>
        <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
          {processedEvents && processedEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {processedEvents.map((event) => (
                <Link 
                  key={event.id}
                  href={`/protected/events/${event.id}`}
                  style={{
                    display: 'block',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out',
                    touchAction: 'manipulation',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        margin: 0
                      }}>
                        {event.name}
                      </h3>
                      <div>{event.status && getStatusBadge(event.status)}</div>
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--muted-foreground)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar style={{ height: '0.875rem', width: '0.875rem', marginRight: '0.5rem' }} />
                        {formatDate(event.date || '')}
                      </div>
                      {event.location && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <MapPin style={{ height: '0.875rem', width: '0.875rem', marginRight: '0.5rem' }} />
                          {event.location}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Users style={{ height: '0.875rem', width: '0.875rem', marginRight: '0.5rem' }} />
                        {event.attendeeCount} attendees
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem 0',
              color: 'var(--muted-foreground)'
            }}>
              <p>No events found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Error display in development */}
      {process.env.NODE_ENV === 'development' && error && (
        <Card style={{ 
          marginTop: '1.5rem', 
          border: '1px solid var(--destructive)',
          background: 'var(--card)'
        }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--destructive)' }}>Error Loading Events</CardTitle>
          </CardHeader>
          <CardContent>
            <pre style={{ 
              fontSize: '0.875rem', 
              overflow: 'auto',
              padding: '0.5rem',
              background: 'var(--muted)',
              borderRadius: '0.25rem'
            }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
