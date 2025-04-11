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
  ChevronRight,
  ArrowUp,
  ArrowDown,
  GlobeIcon,
  MapIcon,
  ArrowRight,
  CalendarPlus,
  Pencil
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

// Date formatting utility
const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export default function ManageEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [user, setUser] = useState<any>(null);
  
  // Mobile detection - use breakpoints that align with standard device sizes
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLightMode, setIsLightMode] = useState(true);
  
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Handle screen size detection with more specific breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // Small mobile devices
      setIsTablet(width >= 640 && width < 1024); // Tablets and small laptops
      setIsDesktop(width >= 1024); // Desktops and large screens
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Detect light/dark mode
  useEffect(() => {
    const detectTheme = () => {
      const isDarkMode = 
        document.documentElement.classList.contains('dark') || 
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setIsLightMode(!isDarkMode);
    };
    
    detectTheme();
    
    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });
    
    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', detectTheme);
    };
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
          // Get traditional attendees count
          const { count: attendeesCount, error: countError } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
            
          // Get accepted RSVPs count - first get invitations with accepted rsvp_status
          const { count: acceptedRsvpsCount, error: rsvpError } = await supabase
            .from('invitations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('rsvp_status', 'accepted');
            
          if (countError) {
            console.error(`Error fetching attendees for event ${event.id}:`, countError);
            attendeeCountsObj[event.id] = acceptedRsvpsCount || 0;
          } else if (rsvpError) {
            console.error(`Error fetching RSVPs for event ${event.id}:`, rsvpError);
            attendeeCountsObj[event.id] = attendeesCount || 0;
          } else {
            // Combine both counts - traditional attendees and accepted RSVPs
            attendeeCountsObj[event.id] = (attendeesCount || 0) + (acceptedRsvpsCount || 0);
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
  
  // Define past events (either completed or with past date)
  const pastEvents = events.filter(event => 
    event.status === 'completed' || 
    (new Date(event.date) < new Date() && event.status !== 'draft')
  );
  
  // Calculate stats for growth and unique locations
  const totalAttendees = Object.values(attendeeCounts).reduce((sum, count) => sum + count, 0);
  const pastEventsGrowth = events.length > 0 ? 5 : 0; // Demo: 5% growth (in a real app would calculate from historical data)
  const attendeesGrowth = totalAttendees > 0 ? 8 : 0; // Demo: 8% growth (in a real app would calculate from historical data)
  const uniqueLocations = events.filter(event => event.location).length;
  
  // Helper functions
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
        opacity: 0.7,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
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
          gap: '8px',
          width: '100%',
          maxWidth: '100%'
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
          </div>
        )}
      </div>
    ));
  };
  
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
      borderRadius: '12px',
      border: '1px solid var(--border)',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <ImageIcon style={{
        width: '48px',
        height: '48px',
        color: 'var(--muted-foreground)',
        marginBottom: '16px'
      }} />
      
      <h3 style={{
        fontSize: '18px',
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
        marginBottom: '24px',
        maxWidth: '460px'
      }}>
        {type === 'published' && 'When you publish events, they will appear here.'}
        {type === 'draft' && 'Draft events will be saved here while you work on them.'}
        {type === 'past' && 'Events marked as completed or past dates will appear here.'}
        {type === 'all' && 'Create your first event to get started.'}
      </p>
      
      <Button asChild style={{
        width: 'auto',
        padding: '0 20px',
        height: '42px'
      }}>
        <Link href="/protected/events/create">Create Event</Link>
      </Button>
    </div>
  );

  // Event item renderer with improved styling
  const renderEventItem = (event: Event) => {
    const formattedDate = formatDate(event.date || '');
    const status = event.status || 'draft';
    const statusColors = {
      published: { bg: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)', border: 'rgba(16, 185, 129, 0.3)' },
      draft: { bg: 'rgba(234, 179, 8, 0.15)', color: 'rgb(234, 179, 8)', border: 'rgba(234, 179, 8, 0.3)' },
      past: { bg: 'rgba(100, 116, 139, 0.15)', color: 'rgb(100, 116, 139)', border: 'rgba(100, 116, 139, 0.3)' },
    };
    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.draft;

    return (
      <Link href={`/protected/events/${event.id}`} style={{
        textDecoration: 'none',
        color: 'inherit'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '16px' : '20px',
          gap: isMobile ? '12px' : '20px',
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--border)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box'
        }} className="hover:shadow-md hover:-translate-y-[1px]">
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto',
          }}>
            <div style={{
              width: isMobile ? '60px' : '80px',
              height: isMobile ? '60px' : '80px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {event.cover_image_url ? (
                <Image 
                  src={event.cover_image_url} 
                  alt={event.name || 'Event cover'} 
                  width={isMobile ? 60 : 80} 
                  height={isMobile ? 60 : 80} 
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(var(--primary-rgb), 0.1)'
                }}>
                  <CalendarIcon size={isMobile ? 24 : 32} color="var(--primary)" />
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.color,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: `1px solid ${statusColor.border}`,
                  whiteSpace: 'nowrap'
                }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CalendarIcon size={12} />
                  {formattedDate}
                </span>
              </div>
              
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: 'var(--foreground)',
                lineHeight: '1.4'
              }}>
                {event.name || 'Untitled Event'}
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '4px'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Users size={14} />
                  {event.attendeeCount} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
                </span>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Button
                variant="outline"
                size="sm"
                style={{
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/protected/events/${event.id}/edit`);
                }}
              >
                <Pencil size={14} />
                Edit
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  // Show details or menu
                }}
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
          
          {isMobile && (
            <div style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <Button
                variant="outline"
                size="sm"
                style={{
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '6px 12px'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/protected/events/${event.id}/edit`);
                }}
              >
                <Pencil size={12} />
                Edit
              </Button>
              
              <ArrowRight size={16} color="var(--muted-foreground)" />
            </div>
          )}
        </div>
      </Link>
    );
  };
  
  // Main render
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      {/* Super minimal header */}
      <div style={{
        display: 'flex',
        padding: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          margin: 0
        }}>
          Manage Events
        </h1>
      </div>

      {/* Stats and Map section - simplified */}
      <div style={{ 
        width: '100%', 
        padding: '16px',
        boxSizing: 'border-box'
      }}>
        {user && (
          <StatsMapWrapper 
            processedEvents={events}
            publishedEvents={publishedEvents}
            attendeeCounts={attendeeCounts}
            mapComponent={<EventsMapClientWrapper />}
          />
        )}
      </div>
      
      {/* Tabs section - simplified structure */}
      <div style={{
        width: '100%', 
        padding: '0 16px 16px',
        boxSizing: 'border-box'
      }}>
        <Tabs defaultValue="all" style={{
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <TabsList style={{
              backgroundColor: 'transparent',
              padding: '2px'
            }}>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <div style={{ marginLeft: 'auto' }}>
              <Link 
                href="/protected/events/create" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <CalendarPlus size={16} />
                Create New Event
              </Link>
            </div>
          </div>
          
          <TabsContent value="all">
            {events.length === 0 ? (
              renderEmptyState('all')
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {events.map(event => (
                  <div key={event.id}>
                    {renderEventItem(event)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="published">
            {publishedEvents.length === 0 ? (
              renderEmptyState('published')
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {publishedEvents.map(event => (
                  <div key={event.id}>
                    {renderEventItem(event)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="draft">
            {draftEvents.length === 0 ? (
              renderEmptyState('draft')
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {draftEvents.map(event => (
                  <div key={event.id}>
                    {renderEventItem(event)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastEvents.length === 0 ? (
              renderEmptyState('past')
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {pastEvents.map(event => (
                  <div key={event.id}>
                    {renderEventItem(event)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
