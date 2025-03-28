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
import { Calendar, MapPin, Users, Plus, Clock, Badge as BadgeIcon, Edit, QrCode, Share, Trash2, Image, CheckCircle, ListFilter, FileText, AlertTriangle, X } from 'lucide-react'
import { EventActions } from '@/components/events/event-actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
      padding: '0.5rem', 
      maxWidth: '100%', 
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Enhanced header card */}
      <Card style={{ 
        marginBottom: '0.75rem', 
        width: '100%',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}>
        <CardContent style={{ 
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Title and description with improved styling */}
          <div style={{ marginBottom: '0.5rem' }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              marginTop: 0,
              marginBottom: '0.25rem' 
            }}>Manage Events</h1>
            <p style={{ 
              color: 'var(--muted-foreground)', 
              fontSize: '0.75rem',
              margin: 0 
            }}>View and manage all your photography events</p>
          </div>
          
          {/* Stats Grid - Enhanced with better visuals */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: '0.5rem',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--background)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              padding: '0.75rem',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }} className="group">
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
                  Total Events
                </span>
                <Calendar style={{ height: '0.8rem', width: '0.8rem', color: 'var(--muted-foreground)' }} className="group-hover:text-primary transition-colors" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{processedEvents.length}</div>
              <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderRadius: '0.5rem' }}></span>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--background)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              padding: '0.75rem',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }} className="group">
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
                  Active Events
                </span>
                <BadgeIcon style={{ height: '0.8rem', width: '0.8rem', color: 'var(--muted-foreground)' }} className="group-hover:text-primary transition-colors" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{publishedEvents.length}</div>
              <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderRadius: '0.5rem' }}></span>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--background)',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              padding: '0.75rem',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }} className="group">
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
                  Total Attendees
                </span>
                <Users style={{ height: '0.8rem', width: '0.8rem', color: 'var(--muted-foreground)' }} className="group-hover:text-primary transition-colors" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {Object.values(attendeeCounts).reduce((total, count) => total + count, 0)}
              </div>
              <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderRadius: '0.5rem' }}></span>
            </div>
          </div>

          {/* Action button for Create Event */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.25rem' }}>
            <Button 
              className="group"
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                height: '2.25rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              asChild
            >
              <Link href="/protected/events/create">
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                Create New Event
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs - Enhanced mobile scrolling with icons */}
      <Tabs defaultValue="all" style={{ marginTop: '0.75rem' }}>
        <TabsList style={{ 
          justifyContent: 'space-around', 
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)',
          padding: '0.5rem',
          marginBottom: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          fontSize: '0.75rem',
          width: '100%',
          display: 'flex',
          WebkitOverflowScrolling: 'touch',
          gap: '0.5rem'
        }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="all" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <ListFilter 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {processedEvents.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {processedEvents.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>All ({processedEvents.length})</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="published" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <CheckCircle 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {publishedEvents.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {publishedEvents.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Published ({publishedEvents.length})</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="draft" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <FileText 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {draftEvents.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {draftEvents.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Draft ({draftEvents.length})</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="completed" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <Clock 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {completedEvents.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {completedEvents.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Completed ({completedEvents.length})</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="cancelled" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <X 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {cancelledEvents.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--destructive)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {cancelledEvents.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Cancelled ({cancelledEvents.length})</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>
        
        {/* All Events Tab - Improved card layout for narrow screens */}
        <TabsContent value="all">
          <div style={{ 
            display: 'grid', 
            gap: '0.5rem',
            gridTemplateColumns: '1fr',
            maxWidth: '100%' 
          }}>
            {processedEvents.length > 0 ? (
              processedEvents.map((event) => (
                <Link 
                  href={`/protected/events/${event.id}`} 
                  key={event.id}
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <div 
                    style={{
                      borderRadius: '0.5rem', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'var(--card)',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflowWrap: 'break-word'
                    }}
                    className="hover:shadow-md hover:border-primary/20"
                  >
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.35rem',
                      width: '100%'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        width: '100%'
                      }}>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          marginBottom: '0.15rem',
                          wordBreak: 'break-word',
                          maxWidth: '100%'
                        }}>{event.name}</h3>
                        {getStatusBadge(event.status || '')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted-foreground)' }}>
                          <Calendar style={{ height: '0.7rem', width: '0.7rem', flexShrink: 0 }} />
                          <span style={{ 
                            fontSize: '0.7rem', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{formatDate(event.date || '')}</span>
                        </div>
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted-foreground)' }}>
                            <MapPin style={{ height: '0.7rem', width: '0.7rem', flexShrink: 0 }} />
                            <span style={{ 
                              fontSize: '0.7rem', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}>{event.location}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted-foreground)' }}>
                          <Users style={{ height: '0.7rem', width: '0.7rem', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.7rem' }}>{event.attendeeCount} attendees</span>
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '0.35rem',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%'
                      }}>
                        <EventActions eventId={event.id} mode="list" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: 'var(--background)',
                borderRadius: '0.5rem',
                color: 'var(--muted-foreground)'
              }}>
                No events found. <Link href="/protected/events/create" style={{ color: 'var(--primary)' }}>Create your first event</Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Published Events Tab - Also improved for narrower screens */}
        <TabsContent value="published">
          <div style={{ 
            display: 'grid', 
            gap: '0.5rem',
            gridTemplateColumns: '1fr',
            maxWidth: '100%'
          }}>
            {publishedEvents.length > 0 ? (
              publishedEvents.map((event) => (
                <Link 
                  href={`/protected/events/${event.id}`} 
                  key={event.id}
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <div 
                    style={{
                      borderRadius: '0.5rem', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: 'var(--card)',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflowWrap: 'break-word'
                    }}
                    className="hover:shadow-md hover:border-primary/20"
                  >
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.35rem',
                      width: '100%'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        width: '100%'
                      }}>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          marginBottom: '0.15rem',
                          wordBreak: 'break-word',
                          maxWidth: '100%'
                        }}>{event.name}</h3>
                        {getStatusBadge(event.status || '')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted-foreground)' }}>
                          <Calendar style={{ height: '0.7rem', width: '0.7rem', flexShrink: 0 }} />
                          <span style={{ 
                            fontSize: '0.7rem', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>{formatDate(event.date || '')}</span>
                        </div>
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted-foreground)' }}>
                            <MapPin style={{ height: '0.7rem', width: '0.7rem', flexShrink: 0 }} />
                            <span style={{ 
                              fontSize: '0.7rem', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}>{event.location}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--muted-foreground)' }}>
                          <Users style={{ height: '0.7rem', width: '0.7rem', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.7rem' }}>{event.attendeeCount} attendees</span>
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '0.35rem',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%'
                      }}>
                        <EventActions eventId={event.id} mode="list" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                backgroundColor: 'var(--background)',
                borderRadius: '0.5rem',
                color: 'var(--muted-foreground)'
              }}>
                No published events. Publish an event to make it visible to attendees.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Additional tabs would follow same pattern */}
        
      </Tabs>
    </div>
  )
}
