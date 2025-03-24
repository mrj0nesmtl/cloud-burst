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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      
      {/* Status filter tabs */}
      <Tabs defaultValue="all" style={{ marginTop: '1rem' }}>
        <TabsList style={{ 
          justifyContent: 'flex-start', 
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)',
          padding: '0',
          marginBottom: '1rem'
        }}>
          <TabsTrigger value="all" style={{ position: 'relative' }}>
            All Events ({processedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="published" style={{ position: 'relative' }}>
            Published ({publishedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="draft" style={{ position: 'relative' }}>
            Draft ({draftEvents.length})
          </TabsTrigger>
          <TabsTrigger value="completed" style={{ position: 'relative' }}>
            Completed ({completedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" style={{ position: 'relative' }}>
            Cancelled ({cancelledEvents.length})
          </TabsTrigger>
        </TabsList>
        
        {/* All Events Tab */}
        <TabsContent value="all">
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Your Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {processedEvents.length > 0 ? (
                processedEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/protected/events/${event.id}`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <div 
                      style={{
                        borderRadius: '0.5rem', 
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'var(--card)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      className="hover:shadow-md hover:border-primary/20"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{event.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{formatDate(event.date || '')}</span>
                            </div>
                            {event.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <MapPin style={{ height: '0.875rem', width: '0.875rem' }} />
                                <span style={{ fontSize: '0.875rem' }}>{event.location}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Users style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{event.attendeeCount} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          {getStatusBadge(event.status || '')}
                          <EventActions eventId={event.id} mode="list" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No events found. Create your first event to get started.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Published Events Tab */}
        <TabsContent value="published">
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Published Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {publishedEvents.length > 0 ? (
                publishedEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/protected/events/${event.id}`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <div 
                      style={{
                        borderRadius: '0.5rem', 
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'var(--card)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      className="hover:shadow-md hover:border-primary/20"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{event.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{formatDate(event.date || '')}</span>
                            </div>
                            {event.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <MapPin style={{ height: '0.875rem', width: '0.875rem' }} />
                                <span style={{ fontSize: '0.875rem' }}>{event.location}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Users style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{event.attendeeCount} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          {getStatusBadge(event.status || '')}
                          <EventActions eventId={event.id} mode="list" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No published events found.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Draft Events Tab */}
        <TabsContent value="draft">
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Draft Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {draftEvents.length > 0 ? (
                draftEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/protected/events/${event.id}`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <div 
                      style={{
                        borderRadius: '0.5rem', 
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'var(--card)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      className="hover:shadow-md hover:border-primary/20"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{event.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{formatDate(event.date || '')}</span>
                            </div>
                            {event.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <MapPin style={{ height: '0.875rem', width: '0.875rem' }} />
                                <span style={{ fontSize: '0.875rem' }}>{event.location}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Users style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{event.attendeeCount} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          {getStatusBadge(event.status || '')}
                          <EventActions eventId={event.id} mode="list" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No draft events found.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Completed Events Tab */}
        <TabsContent value="completed">
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Completed Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completedEvents.length > 0 ? (
                completedEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/protected/events/${event.id}`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <div 
                      style={{
                        borderRadius: '0.5rem', 
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'var(--card)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      className="hover:shadow-md hover:border-primary/20"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{event.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{formatDate(event.date || '')}</span>
                            </div>
                            {event.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <MapPin style={{ height: '0.875rem', width: '0.875rem' }} />
                                <span style={{ fontSize: '0.875rem' }}>{event.location}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Users style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{event.attendeeCount} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          {getStatusBadge(event.status || '')}
                          <EventActions eventId={event.id} mode="list" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No completed events found.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Cancelled Events Tab */}
        <TabsContent value="cancelled">
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Cancelled Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cancelledEvents.length > 0 ? (
                cancelledEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/protected/events/${event.id}`}
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <div 
                      style={{
                        borderRadius: '0.5rem', 
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'var(--card)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                      className="hover:shadow-md hover:border-primary/20"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{event.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{formatDate(event.date || '')}</span>
                            </div>
                            {event.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <MapPin style={{ height: '0.875rem', width: '0.875rem' }} />
                                <span style={{ fontSize: '0.875rem' }}>{event.location}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                              <Users style={{ height: '0.875rem', width: '0.875rem' }} />
                              <span style={{ fontSize: '0.875rem' }}>{event.attendeeCount} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          {getStatusBadge(event.status || '')}
                          <EventActions eventId={event.id} mode="list" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                  No cancelled events found.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
