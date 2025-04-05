'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Mail, AlertCircle, Calendar, Users, Info, Search, ArrowRight, CheckCircle2, XCircle, Clock, Eye, Plus, UserPlus, MailOpen } from 'lucide-react'
import { Shell } from '@/components/shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import type { InvitationWithEvent } from '@/types/invitations'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

// Page metadata
const pageTitle = 'All Guest Invitations';
const pageDescription = 'Manage and track invitations across all your events';

// Define interface for invitation objects to fix TypeScript errors
interface Invitation {
  id: string;
  email: string;
  name?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  event_id: string;
  events?: Array<{
    id: string;
    name: string;
    date?: string;
  }>;
}

interface EventCount {
  id: string;
  name: string;
  date?: string;
  count: number;
  accepted: number;
  declined: number;
  pending: number;
}

// Add a proper date formatter function
function formatEventDate(dateString: string | undefined): string {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid date';
  }
}

// Format date to relative time (e.g., "2 days ago")
function formatDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch (e) {
    return 'Invalid date'
  }
}

// Utility function to fetch event name for event IDs where data is missing
async function fetchEventName(eventId: string): Promise<string> {
  try {
    const supabase = createClient<Database>();
    const { data, error } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId as unknown as string)
      .single();
    
    if (error || !data) {
      console.error('Error fetching event name:', error);
      return 'Event Not Found';
    }
    
    // Type assertion to ensure TypeScript knows data has a name property
    return (data as { name: string }).name;
  } catch (error) {
    console.error('Error in fetchEventName:', error);
    return 'Error Loading Name';
  }
}

export default function InvitationsPage() {
  // Mobile detection - Client Component
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [eventCountsArray, setEventCountsArray] = useState<EventCount[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    openedCount: 0,
    acceptedCount: 0,
    declinedCount: 0,
    totalCount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Client-side data fetching
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch data from an API endpoint instead of using server components directly
        const response = await fetch('/api/invitations');
        if (!response.ok) {
          throw new Error('Failed to fetch invitations data');
        }
        
        const data = await response.json();
        
        // Set invitations
        setInvitations(data.invitations || []);
        
        // Calculate counts and stats
        const totalCount = data.invitations?.length || 0;
        const pendingCount = data.invitations?.filter((inv: Invitation) => inv.status === 'pending' || inv.status === 'sent').length || 0;
        const openedCount = data.invitations?.filter((inv: Invitation) => inv.status === 'opened').length || 0;
        const acceptedCount = data.invitations?.filter((inv: Invitation) => inv.status === 'accepted').length || 0;
        const declinedCount = data.invitations?.filter((inv: Invitation) => inv.status === 'declined').length || 0;
        
        // Calculate event counts
        const eventCounts: Record<string, EventCount> = {};
        
        // First pass: Initialize with data from API
        for (const inv of data.invitations || []) {
          const eventId = inv.event_id;
          if (!eventCounts[eventId]) {
            const eventData = inv.events?.[0];
            
            eventCounts[eventId] = {
              id: eventId,
              name: eventData?.name || 'Loading Event...',
              date: eventData?.date,
              count: 0,
              accepted: 0,
              declined: 0,
              pending: 0
            };
          }
          
          eventCounts[eventId].count++;
          
          if (inv.status === 'accepted') {
            eventCounts[eventId].accepted++;
          } else if (inv.status === 'declined') {
            eventCounts[eventId].declined++;
          } else {
            eventCounts[eventId].pending++;
          }
        }
        
        // Second pass: Fetch missing event names
        const eventPromises = Object.entries(eventCounts)
          .filter(([_, event]) => event.name === 'Loading Event...')
          .map(async ([eventId, event]) => {
            const name = await fetchEventName(eventId);
            eventCounts[eventId].name = name;
          });
          
        await Promise.all(eventPromises);
        
        // Convert to array and sort
        const eventCountsArray = Object.values(eventCounts) as EventCount[];
        eventCountsArray.sort((a, b) => new Date(b.date || '0').getTime() - new Date(a.date || '0').getTime());
        
        // Update state
        setEventCountsArray(eventCountsArray);
        setStats({
          pendingCount,
          openedCount,
          acceptedCount,
          declinedCount,
          totalCount
        });
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter invitations based on search query
  const filteredInvitations = searchQuery 
    ? invitations.filter(inv => 
        inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.events?.[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invitations;

  const { pendingCount, openedCount, acceptedCount, declinedCount, totalCount } = stats;

  if (loading) {
    return (
      <div style={{ 
        width: '100%',
        height: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading invitations...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      maxWidth: '1600px',
      margin: '0 auto',
      overflowX: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: '24px',
        gap: isMobile ? '16px' : '24px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            lineHeight: '1.2',
            marginBottom: '4px'
          }}>
            {pageTitle}
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {pageDescription}
          </p>
        </div>
        <Button asChild variant="default">
          <Link href="/protected/events">
            <Calendar className="h-4 w-4 mr-2" />
            My Events
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : isTablet 
            ? 'repeat(2, 1fr)' 
            : 'repeat(4, 1fr)', 
        gap: '16px',
        marginBottom: '24px',
        width: '100%'
      }}>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
              Total Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{totalCount}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>
              Across all events
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(22, 163, 74)' }}>
                {acceptedCount}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                backgroundColor: 'rgb(240, 253, 244)', 
                color: 'rgb(21, 128, 61)', 
                padding: '2px 8px', 
                borderRadius: '9999px' 
              }}>
                {totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0}%
              </div>
            </div>
            <div style={{ 
              height: '8px', 
              backgroundColor: 'var(--muted)', 
              borderRadius: '9999px', 
              overflow: 'hidden' 
            }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: 'rgb(34, 197, 94)', 
                  borderRadius: '9999px',
                  width: `${totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(220, 38, 38)' }}>
                {declinedCount}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                backgroundColor: 'rgb(254, 242, 242)', 
                color: 'rgb(185, 28, 28)', 
                padding: '2px 8px', 
                borderRadius: '9999px' 
              }}>
                {totalCount > 0 ? Math.round((declinedCount / totalCount) * 100) : 0}%
              </div>
            </div>
            <div style={{ 
              height: '8px', 
              backgroundColor: 'var(--muted)', 
              borderRadius: '9999px', 
              overflow: 'hidden' 
            }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: 'rgb(239, 68, 68)', 
                  borderRadius: '9999px',
                  width: `${totalCount > 0 ? (declinedCount / totalCount) * 100 : 0}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader style={{ paddingBottom: '8px' }}>
            <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--muted-foreground)' }}>
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'rgb(202, 138, 4)' }}>
                {pendingCount + openedCount}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                backgroundColor: 'rgb(254, 249, 195)', 
                color: 'rgb(161, 98, 7)', 
                padding: '2px 8px', 
                borderRadius: '9999px' 
              }}>
                {totalCount > 0 ? Math.round(((pendingCount + openedCount) / totalCount) * 100) : 0}%
              </div>
            </div>
            <div style={{ 
              height: '8px', 
              backgroundColor: 'var(--muted)', 
              borderRadius: '9999px', 
              overflow: 'hidden' 
            }}>
              <div 
                style={{ 
                  height: '100%', 
                  backgroundColor: 'rgb(234, 179, 8)', 
                  borderRadius: '9999px',
                  width: `${totalCount > 0 ? ((pendingCount + openedCount) / totalCount) * 100 : 0}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card - Redesigned Invitation Management */}
      <Card style={{ 
        width: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <CardHeader style={{ 
          paddingBottom: '0', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '16px',
            paddingBottom: '16px'
          }}>
            <div>
              <CardTitle style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                marginBottom: '4px'
              }}>
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Invitation Management Center
              </CardTitle>
              <CardDescription>
                Send, track, and manage all your event invitations in one place
              </CardDescription>
            </div>
            <div style={{ 
              position: 'relative', 
              width: isMobile ? '100%' : 'auto' 
            }}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search invitations..." 
                className="pl-8"
                style={{ 
                  width: isMobile ? '100%' : '250px',
                  paddingLeft: '32px'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        {/* The Main Content Area */}
        <div style={{ 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Quick Actions Bar */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            justifyContent: 'flex-start',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <Button asChild variant="default" size={isMobile ? "default" : "sm"}>
              <Link href="/protected/events/new/invitations">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Invitations
              </Link>
            </Button>
            
            <Button asChild variant="outline" size={isMobile ? "default" : "sm"}>
              <Link href="/protected/events">
                <Calendar className="h-4 w-4 mr-2" />
                Select Event
              </Link>
            </Button>
          </div>
          
          {/* Main Content Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr',
            gap: '24px'
          }}>
            {/* Recent Invitations Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <MailOpen className="h-4 w-4 mr-2 text-primary" />
                  Recent Invitations
                </h3>
                <Badge variant="outline" style={{ backgroundColor: 'var(--background)' }}>
                  {filteredInvitations.length} total
                </Badge>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <div style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: 'var(--background)'
                }}>
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="accepted">Accepted</TabsTrigger>
                    <TabsTrigger value="declined">Declined</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </div>
                
                <div style={{ 
                  maxHeight: '350px', 
                  overflowY: 'auto',
                  backgroundColor: 'var(--background)'
                }}>
                  <TabsContent value="all" className="m-0 p-0">
                    <InvitationsList 
                      invitations={filteredInvitations} 
                      emptyMessage="No invitations found. Try creating some!"
                      isMobile={isMobile}
                    />
                  </TabsContent>
                  <TabsContent value="accepted" className="m-0 p-0">
                    <InvitationsList 
                      invitations={filteredInvitations.filter(inv => inv.status === 'accepted')} 
                      emptyMessage="No accepted invitations"
                      isMobile={isMobile}
                    />
                  </TabsContent>
                  <TabsContent value="declined" className="m-0 p-0">
                    <InvitationsList 
                      invitations={filteredInvitations.filter(inv => inv.status === 'declined')} 
                      emptyMessage="No declined invitations"
                      isMobile={isMobile}
                    />
                  </TabsContent>
                  <TabsContent value="pending" className="m-0 p-0">
                    <InvitationsList 
                      invitations={filteredInvitations.filter(inv => 
                        ['pending', 'sent', 'opened'].includes(inv.status))} 
                      emptyMessage="No pending invitations"
                      isMobile={isMobile}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            
            {/* Events with Invitations Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Events with Invitations
                </h3>
                <Badge variant="outline" style={{ backgroundColor: 'var(--background)' }}>
                  {eventCountsArray.length} events
                </Badge>
              </div>
              
              <div style={{
                padding: '16px',
                flexGrow: 1,
                overflowY: 'auto',
                backgroundColor: 'var(--background)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {eventCountsArray.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px'
                  }}>
                    {eventCountsArray.map((event) => (
                      <Link 
                        key={event.id}
                        href={`/protected/events/${event.id}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'block'
                        }}
                      >
                        <div 
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'var(--background)',
                            cursor: 'pointer'
                          }}
                          className="hover:border-primary hover:shadow-sm"
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              {event.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>
                                {event.name}
                              </h4>
                              <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                {formatEventDate(event.date)}
                              </p>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            fontSize: '0.875rem'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-8 h-8 flex items-center justify-center p-0">
                                {event.accepted}
                              </Badge>
                              <span style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--muted-foreground)' }}>
                                Accepted
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 w-8 h-8 flex items-center justify-center p-0">
                                {event.declined}
                              </Badge>
                              <span style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--muted-foreground)' }}>
                                Declined
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 w-8 h-8 flex items-center justify-center p-0">
                                {event.pending}
                              </Badge>
                              <span style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--muted-foreground)' }}>
                                Pending
                              </span>
                            </div>
                          </div>
                          
                          <Button asChild variant="default" size="sm" className="mt-2">
                            <Link href={`/protected/events/${event.id}/invitations`}>
                              Manage
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 16px',
                    textAlign: 'center',
                    border: '1px dashed var(--border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--muted)'
                  }}>
                    <Calendar style={{
                      width: '48px',
                      height: '48px',
                      color: 'var(--muted-foreground)',
                      opacity: 0.5,
                      marginBottom: '16px'
                    }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                      No events with invitations
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--muted-foreground)',
                      maxWidth: '400px',
                      marginBottom: '24px'
                    }}>
                      Start by creating an event and inviting guests to get started
                    </p>
                    <Button asChild variant="default">
                      <Link href="/protected/events/new">
                        <Calendar className="h-4 w-4 mr-2" />
                        Create New Event
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pro Tip Footer */}
        <CardFooter style={{ 
          borderTop: '1px solid var(--border)', 
          backgroundColor: 'var(--muted-50)',
          padding: isMobile ? '12px 16px' : '16px 24px'
        }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: 'var(--muted-foreground)'
                }}>
                  <Info className="h-4 w-4 mr-2 text-primary" />
                  Pro Tip: Create invitations from the specific event page for better organization
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ maxWidth: '300px' }}>
                  Each event has its own invitation management page where you 
                  can send, track, and manage invitations specifically for that event.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  );
}

// Clean up component for displaying a list of invitations
function InvitationsList({ 
  invitations, 
  emptyMessage,
  isMobile
}: { 
  invitations: Invitation[], 
  emptyMessage: string,
  isMobile: boolean
}) {
  if (invitations.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '32px 16px',
        textAlign: 'center'
      }}>
        <Mail style={{ 
          height: '32px', 
          width: '32px', 
          color: 'var(--muted-foreground)',
          marginBottom: '8px',
          opacity: 0.5
        }} />
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          {emptyMessage}
        </h3>
      </div>
    );
  }
  
  return (
    <div style={{ 
      borderTop: 'none', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {invitations.map((invitation) => (
        <div 
          key={invitation.id} 
          style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            transition: 'background-color 0.15s ease'
          }}
          className="hover:bg-muted/50"
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px'
            }}>
              <div style={{ fontWeight: '500' }}>
                {invitation.name || invitation.email.split('@')[0]}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--muted-foreground)'
              }}>
                {invitation.email}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--muted-foreground)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar className="h-3 w-3" />
                <Link href={`/protected/events/${invitation.event_id}`} className="hover:text-primary hover:underline">
                  {invitation.events?.[0]?.name || 'Event Details'}
                </Link>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px'
              }}>
                {getStatusIcon(invitation.status)}
              </div>
              <div>
                {getStatusBadge(invitation.status)}
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--muted-foreground)'
            }}>
              {formatDate(invitation.updated_at || invitation.created_at)}
            </div>
            <Button 
              asChild 
              size="sm" 
              variant="ghost" 
              style={{ 
                height: '28px', 
                padding: '0 8px'
              }}
            >
              <Link href={`/protected/events/${invitation.event_id}/invitations`}>
                Details 
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'sent':
      return <Mail className="h-4 w-4 text-blue-500" />
    case 'opened':
      return <Eye className="h-4 w-4 text-yellow-500" />
    case 'accepted':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'declined':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>
    case 'opened':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Opened</Badge>
    case 'accepted':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>
    case 'declined':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>
    case 'draft':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>
    default:
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>
  }
} 