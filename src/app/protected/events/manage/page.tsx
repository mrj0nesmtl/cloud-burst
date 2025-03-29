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
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Clock, 
  Badge as BadgeIcon, 
  Edit, 
  QrCode, 
  Share, 
  Trash2, 
  Image, 
  CheckCircle, 
  ListFilter, 
  FileText, 
  AlertTriangle, 
  X,
  CalendarIcon,
  Activity,
  Eye
} from 'lucide-react'
import { EventActions } from '@/components/events/event-actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Suspense } from 'react'

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
      return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/20 border-none">Draft</Badge>
    case 'published':
      return <Badge className="bg-green-500/90 hover:bg-green-500/90 border-none">Published</Badge>
    case 'completed':
      return <Badge className="bg-blue-500/90 hover:bg-blue-500/90 border-none">Completed</Badge>
    case 'cancelled':
      return <Badge className="bg-red-500/90 hover:bg-red-500/90 border-none">Cancelled</Badge>
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
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ width: '100%', padding: '24px', flex: '1 1 auto' }}>
        {/* Header and Create Event Button */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Manage Events</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              View and manage all your photography events
            </p>
          </div>
          <Link href="/protected/events/create">
            <Button size="sm" className="w-full sm:w-auto h-10" style={{ 
              background: 'var(--primary)',
              borderRadius: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--background)',
        }}>
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Total Events</CardTitle>
              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{processedEvents.length}</div>
              <p className="text-sm text-muted-foreground">Events created</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Active Events</CardTitle>
              <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{publishedEvents.length}</div>
              <p className="text-sm text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Total Attendees</CardTitle>
              <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.values(attendeeCounts).reduce((total, count) => total + count, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Event participants</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Event List</CardTitle>
                <CardDescription className="text-sm">
                  Manage and monitor your events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all" className="flex items-center justify-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>All ({processedEvents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="published" className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Published ({publishedEvents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="draft" className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Draft ({draftEvents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Completed ({completedEvents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="flex items-center justify-center gap-2">
                  <X className="h-4 w-4" />
                  <span>Cancelled ({cancelledEvents.length})</span>
                </TabsTrigger>
              </TabsList>
              
              {/* All Events Tab */}
              <TabsContent value="all" className="mt-0">
                <div className="space-y-4">
                  {processedEvents.length > 0 ? (
                    processedEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{event.name}</h3>
                                {getStatusBadge(event.status || '')}
                              </div>
                              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{formatDate(event.date || '')}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground/70" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{event.attendeeCount} attendees</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="h-8">
                                <Link href={`/protected/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                              <EventActions eventId={event.id} mode="list" />
                            </div>
                          </div>
                        </CardContent>
                        <div className="h-px w-full bg-border" />
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center mb-4">No events found</p>
                        <Button size="sm" asChild>
                          <Link href="/protected/events/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create your first event
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Published Events Tab */}
              <TabsContent value="published" className="mt-0">
                <div className="space-y-4">
                  {publishedEvents.length > 0 ? (
                    publishedEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{event.name}</h3>
                                {getStatusBadge(event.status || '')}
                              </div>
                              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{formatDate(event.date || '')}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground/70" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{event.attendeeCount} attendees</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="h-8">
                                <Link href={`/protected/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                              <EventActions eventId={event.id} mode="list" />
                            </div>
                          </div>
                        </CardContent>
                        <div className="h-px w-full bg-border" />
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center mb-4">No published events</p>
                        <Button size="sm" asChild>
                          <Link href="/protected/events/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create new event
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Draft Events Tab */}
              <TabsContent value="draft" className="mt-0">
                <div className="space-y-4">
                  {draftEvents.length > 0 ? (
                    draftEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{event.name}</h3>
                                {getStatusBadge(event.status || '')}
                              </div>
                              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{formatDate(event.date || '')}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground/70" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="h-8">
                                <Link href={`/protected/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                              <EventActions eventId={event.id} mode="list" />
                            </div>
                          </div>
                        </CardContent>
                        <div className="h-px w-full bg-border" />
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center">No draft events</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Completed Events Tab */}
              <TabsContent value="completed" className="mt-0">
                <div className="space-y-4">
                  {completedEvents.length > 0 ? (
                    completedEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{event.name}</h3>
                                {getStatusBadge(event.status || '')}
                              </div>
                              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{formatDate(event.date || '')}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground/70" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{event.attendeeCount} attendees</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="h-8">
                                <Link href={`/protected/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                              <EventActions eventId={event.id} mode="list" />
                            </div>
                          </div>
                        </CardContent>
                        <div className="h-px w-full bg-border" />
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center">No completed events</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {/* Cancelled Events Tab */}
              <TabsContent value="cancelled" className="mt-0">
                <div className="space-y-4">
                  {cancelledEvents.length > 0 ? (
                    cancelledEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold">{event.name}</h3>
                                {getStatusBadge(event.status || '')}
                              </div>
                              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{formatDate(event.date || '')}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground/70" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="h-8">
                                <Link href={`/protected/events/${event.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                              <EventActions eventId={event.id} mode="list" />
                            </div>
                          </div>
                        </CardContent>
                        <div className="h-px w-full bg-border" />
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <X className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center">No cancelled events</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
