"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  FileEditIcon, 
  EyeIcon, 
  AlertTriangleIcon, 
  Activity,
  Users,
  MapPin,
  ImageIcon,
  ChevronRight
} from 'lucide-react';
import { EventsMapClientWrapper } from './map-client-wrapper';
import { StatsMapWrapper } from './stats-map-wrapper';
import { useRouter } from 'next/navigation';

// Define event types for type safety
type EventStatus = 'published' | 'draft' | 'completed' | 'cancelled';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string | null;
  status: EventStatus;
  attendeeCount: number;
  cover_image_url?: string | null;
}

export default function ManageEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [user, setUser] = useState<any>(null);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Check user authentication
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.error('Error fetching user:', error);
        router.push('/auth/signin?returnTo=/protected/events/manage');
        return;
      }
      
      setUser(data.user);
    }
    
    getUser();
  }, [supabase, router]);
  
  // Fetch events data when user is available
  useEffect(() => {
    if (!user) return;
    
    async function fetchEvents() {
      try {
        setLoading(true);
        
        // Fetch events with attendee counts
        const { data: events, error } = await supabase
          .from('events')
          .select(`
            id,
            name,
            date,
            location,
            status,
            cover_image_url,
            created_at
          `)
          .eq('organizer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching events:', error);
          return;
        }
        
        // Get attendee counts in a separate query
        const attendeeCountsObj: Record<string, number> = {};
        
        for (const event of events) {
          const { count, error: countError } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
            
          if (countError) {
            console.error(`Error fetching attendees for event ${event.id}:`, countError);
            attendeeCountsObj[event.id] = 0;
          } else {
            attendeeCountsObj[event.id] = count || 0;
          }
        }
        
        setAttendeeCounts(attendeeCountsObj);
        
        // Transform data to match our interface
        const processedEvents = events.map(event => ({
          id: event.id,
          name: event.name,
          date: event.date,
          location: event.location,
          status: event.status as EventStatus,
          attendeeCount: attendeeCountsObj[event.id] || 0,
          cover_image_url: event.cover_image_url
        }));
        
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error in fetchEvents:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [supabase, user]);
  
  // Filter events by status
  const publishedEvents = events.filter(event => event.status === 'published');
  const draftEvents = events.filter(event => event.status === 'draft');
  const completedEvents = events.filter(event => event.status === 'completed');
  const cancelledEvents = events.filter(event => event.status === 'cancelled');
  
  // Helper functions
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status: EventStatus) => {
    // Style configuration for different statuses
    const getStatusStyle = (status: EventStatus) => {
      switch (status) {
        case 'published':
          return {
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          };
        case 'draft':
          return {
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          };
        case 'completed':
          return {
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          };
        case 'cancelled':
          return {
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          };
        default:
          return {
            background: 'rgba(100, 116, 139, 0.15)',
            color: '#64748b',
            border: '1px solid rgba(100, 116, 139, 0.4)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          };
      }
    };
    
    const style = getStatusStyle(status);
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...style
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Loading skeleton
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        marginBottom: '12px',
        backgroundColor: 'var(--card)',
        opacity: 0.7
      }}>
        <div style={{
          width: isMobile ? '100%' : '50px',
          height: isMobile ? '120px' : '50px',
          backgroundColor: 'var(--accent)',
          borderRadius: isMobile ? '8px' : '25px',
          flexShrink: 0
        }} />
        
        <div style={{
          flex: '1', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px'
        }}>
          <div style={{
            height: '24px',
            width: '70%',
            backgroundColor: 'var(--accent)',
            borderRadius: '4px'
          }} />
          
          <div style={{
            height: '16px',
            width: '40%',
            backgroundColor: 'var(--accent)',
            borderRadius: '4px'
          }} />
          
          <div style={{
            height: '16px',
            width: '60%',
            backgroundColor: 'var(--accent)',
            borderRadius: '4px'
          }} />
        </div>
        
        {!isMobile && (
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <div style={{
              height: '36px',
              width: '80px',
              backgroundColor: 'var(--accent)',
              borderRadius: '4px'
            }} />
            <div style={{
              height: '36px',
              width: '80px',
              backgroundColor: 'var(--accent)',
              borderRadius: '4px'
            }} />
          </div>
        )}
      </div>
    ));
  };
  
  // Render an event item
  const renderEventItem = (event: Event, index: number) => (
    <div key={event.id} style={{
      position: 'relative',
      marginBottom: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(var(--primary-rgb), 0.2)',
      overflow: 'hidden',
      backgroundColor: 'var(--card)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }} onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.4)';
      e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--card) 95%, var(--primary) 5%)';
    }} onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.2)';
      e.currentTarget.style.backgroundColor = 'var(--card)';
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        padding: '20px',
        alignItems: isMobile ? 'flex-start' : 'center',
        position: 'relative',
        borderLeft: `4px solid ${getEventColor(event.status, 0.8)}`
      }}>
        {/* Event thumbnail or avatar */}
        <div style={{
          flexShrink: 0,
          width: isMobile ? '100%' : '56px',
          height: isMobile ? '140px' : '56px',
          borderRadius: isMobile ? '8px' : '28px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(var(--primary-rgb), 0.3)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
        }}>
          {event.cover_image_url ? (
            <Image 
              src={event.cover_image_url}
              alt={event.name}
              fill
              style={{
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: getEventColor(event.status, 1),
              fontSize: isMobile ? '26px' : '20px',
              fontWeight: 600,
              color: '#fff'
            }}>
              {getInitials(event.name)}
            </div>
          )}
        </div>
        
        {/* Event details */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--foreground)'
            }}>
              {event.name}
            </h3>
            {getStatusBadge(event.status)}
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : '16px',
            fontSize: '14px',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CalendarIcon style={{ width: '16px', height: '16px', color: 'rgba(var(--primary-rgb), 0.7)' }} />
              <span>{formatDate(event.date)}</span>
            </div>
            
            {event.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin style={{ width: '16px', height: '16px', color: 'rgba(var(--primary-rgb), 0.7)' }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {event.location}
                </span>
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            marginTop: '4px'
          }}>
            <Users style={{ width: '16px', height: '16px', color: 'rgba(var(--primary-rgb), 0.7)' }} />
            <span>{event.attendeeCount} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}</span>
          </div>
        </div>
        
        {/* Action buttons on larger screens, arrow icon on mobile */}
        {isMobile ? (
          <ChevronRight style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '18px',
            height: '18px',
            color: 'rgba(var(--primary-rgb), 0.7)'
          }} />
        ) : (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginLeft: 'auto'
          }}>
            <Button size="sm" variant="outline" asChild style={{
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              borderColor: 'rgba(var(--primary-rgb), 0.2)'
            }}>
              <Link href={`/protected/events/${event.id}`}>
                <EyeIcon style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                View
              </Link>
            </Button>
            <Button size="sm" asChild style={{
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              <Link href={`/protected/events/${event.id}/edit`}>
                <FileEditIcon style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                Manage
              </Link>
            </Button>
          </div>
        )}
        
        {/* Make the entire item clickable */}
        <Link href={`/protected/events/${event.id}`} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5
        }}>
          <span style={{ display: 'none' }}>View event</span>
        </Link>
      </div>
    </div>
  );
  
  // Helper function to get color based on event status with alpha transparency
  const getEventColor = (status: EventStatus, alpha = 1) => {
    switch (status) {
      case 'published':
        return `rgba(16, 185, 129, ${alpha})`;
      case 'draft':
        return `rgba(245, 158, 11, ${alpha})`;
      case 'completed':
        return `rgba(59, 130, 246, ${alpha})`;
      case 'cancelled':
        return `rgba(239, 68, 68, ${alpha})`;
      default:
        return `rgba(100, 116, 139, ${alpha})`;
    }
  };
  
  // Empty state component
  const renderEmptyState = (type: string) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--card)',
      borderRadius: '8px',
      border: '1px solid var(--border)'
    }}>
      <ImageIcon style={{
        width: '48px',
        height: '48px',
        color: 'var(--muted-foreground)',
        marginBottom: '16px'
      }} />
      
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        margin: 0,
        marginBottom: '8px'
      }}>
        No {type} events
      </h3>
      
      <p style={{
        fontSize: '14px',
        color: 'var(--muted-foreground)',
        margin: 0,
        marginBottom: '16px',
        maxWidth: '400px'
      }}>
        {type === 'published' && 'When you publish events, they will appear here.'}
        {type === 'draft' && 'Draft events will be saved here while you work on them.'}
        {type === 'completed' && 'Events marked as completed will appear here.'}
        {type === 'cancelled' && 'Events that have been cancelled will appear here.'}
        {type === '' && 'Create your first event to get started.'}
      </p>
      
      <Button asChild>
        <Link href="/protected/events/create">Create Event</Link>
      </Button>
    </div>
  );
  
  // Main render
  return (
    <div style={{
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: isMobile ? '16px' : '24px',
      marginLeft: 'auto',
      marginRight: 'auto',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '16px' : '0',
        width: '100%'
      }}>
        <div style={{ maxWidth: '100%' }}>
          <h1 style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: 700,
            margin: 0,
            marginBottom: '8px'
          }}>
            Manage Events
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            margin: 0
          }}>
          Create, update, and manage your events all in one place.
        </p>
      </div>

        <Button asChild style={{
          width: isMobile ? '100%' : 'auto',
          flexShrink: 0
        }}>
          <Link 
            href="/protected/events/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}
          >
            <CalendarIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              Create New Event
            </Link>
          </Button>
      </div>
      
      {/* Stats and Map section */}
      <div style={{ width: '100%', overflowX: 'hidden' }}>
        {user && (
      <StatsMapWrapper 
            processedEvents={events}
        publishedEvents={publishedEvents}
        attendeeCounts={attendeeCounts}
        mapComponent={<EventsMapClientWrapper />}
      />
        )}
      </div>
      
      {/* Tabs section */}
      <Tabs defaultValue="all" style={{
        width: '100%'
      }}>
        <div style={{
          overflowX: 'auto',
          paddingBottom: '2px', // Prevent scrollbar cutting off focus rings
          WebkitOverflowScrolling: 'touch',
          marginBottom: '16px'
        }}>
          <TabsList style={{
            display: 'flex',
            width: isMobile ? 'max-content' : '100%',
            padding: '4px',
            backgroundColor: 'rgba(var(--card-rgb), 0.8)',
            borderRadius: '10px',
            border: '1px solid rgba(var(--primary-rgb), 0.25)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <TabsTrigger value="all" style={{
              borderRadius: '8px',
              fontWeight: 500,
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}>
              All Events
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(var(--primary-rgb), 0.15)',
                color: 'var(--primary)',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(var(--primary-rgb), 0.3)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {events.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="published" style={{
              borderRadius: '8px',
              fontWeight: 500,
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}>
              Published
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {publishedEvents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="draft" style={{
              borderRadius: '8px',
              fontWeight: 500,
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}>
              Draft
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {draftEvents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" style={{
              borderRadius: '8px',
              fontWeight: 500,
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}>
              Completed
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {completedEvents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" style={{
              borderRadius: '8px',
              fontWeight: 500,
              padding: '8px 16px',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }}>
              Cancelled
              <span style={{
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {cancelledEvents.length}
              </span>
            </TabsTrigger>
        </TabsList>
        </div>
        
        <div style={{ marginTop: '16px', width: '100%', overflowX: 'hidden' }}>
          <TabsContent value="all" style={{ width: '100%' }}>
            {loading ? (
              renderSkeletons()
            ) : events.length > 0 ? (
              events.map((event, index) => renderEventItem(event, index))
            ) : (
              renderEmptyState("")
            )}
        </TabsContent>
        
          <TabsContent value="published" style={{ width: '100%' }}>
            {loading ? (
              renderSkeletons()
            ) : publishedEvents.length > 0 ? (
              publishedEvents.map((event, index) => renderEventItem(event, index))
            ) : (
              renderEmptyState("published")
            )}
        </TabsContent>
        
          <TabsContent value="draft" style={{ width: '100%' }}>
            {loading ? (
              renderSkeletons()
            ) : draftEvents.length > 0 ? (
              draftEvents.map((event, index) => renderEventItem(event, index))
            ) : (
              renderEmptyState("draft")
            )}
        </TabsContent>
        
          <TabsContent value="completed" style={{ width: '100%' }}>
            {loading ? (
              renderSkeletons()
            ) : completedEvents.length > 0 ? (
              completedEvents.map((event, index) => renderEventItem(event, index))
            ) : (
              renderEmptyState("completed")
            )}
        </TabsContent>
        
          <TabsContent value="cancelled" style={{ width: '100%' }}>
            {loading ? (
              renderSkeletons()
            ) : cancelledEvents.length > 0 ? (
              cancelledEvents.map((event, index) => renderEventItem(event, index))
            ) : (
              renderEmptyState("cancelled")
            )}
          </TabsContent>
          </div>
      </Tabs>
    </div>
  );
}
