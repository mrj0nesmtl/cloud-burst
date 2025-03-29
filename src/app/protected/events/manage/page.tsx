import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarIcon, 
  FileEditIcon, 
  EyeIcon, 
  AlertTriangleIcon, 
  Activity, 
  Users 
} from 'lucide-react';
import { EventsMapClientWrapper } from './map-client-wrapper'
import { StatsMapWrapper } from './stats-map-wrapper'

// Define event types for type safety
type EventStatus = 'published' | 'draft' | 'completed' | 'cancelled';

interface EventData {
  id: string;
  name: string;
  date: string;
  location: string;
  status: EventStatus;
  attendeeCount: number;
}

// The rest of the component will be imported from a client component
// The StatsAndMapWrapper is moved to a separate file

export default async function ManageEventsPage() {
  // This is a mock function that would be replaced with actual data fetching
  const getMockEvents = (): EventData[] => {
    return [
      {
        id: "evt-001",
        name: "Summer Music Festival",
        date: "2025-06-15",
        location: "Central Park, New York",
        status: "published",
        attendeeCount: 1500
      },
      {
        id: "evt-002",
        name: "Corporate Tech Conference",
        date: "2025-07-10",
        location: "Convention Center, San Francisco",
        status: "published",
        attendeeCount: 850
      },
      {
        id: "evt-003",
        name: "Charity Gala Dinner",
        date: "2025-05-28",
        location: "Grand Hotel, Chicago",
        status: "completed",
        attendeeCount: 350
      },
      {
        id: "evt-004",
        name: "Product Launch Event",
        date: "2025-08-20",
        location: "Tech Campus, Seattle",
        status: "draft",
        attendeeCount: 0
      },
      {
        id: "evt-005",
        name: "Wedding Expo",
        date: "2025-09-05",
        location: "Wedding Venue, Los Angeles",
        status: "draft",
        attendeeCount: 0
      },
      {
        id: "evt-006",
        name: "Annual Shareholder Meeting",
        date: "2025-04-30",
        location: "Corporate HQ, Boston",
        status: "cancelled",
        attendeeCount: 0
      },
      {
        id: "evt-007",
        name: "Photography Workshop",
        date: "2025-06-25",
        location: "Art Gallery, Portland",
        status: "published",
        attendeeCount: 45
      },
      {
        id: "evt-008",
        name: "Fashion Show",
        date: "2025-08-12",
        location: "Fashion District, New York",
        status: "draft",
        attendeeCount: 0
      },
    ];
  };

  const mockEvents = getMockEvents();
  const processedEvents = mockEvents;

  // Filter for published events
  const publishedEvents = processedEvents.filter(event => event.status === 'published');
  
  // Get attendee counts by event ID
  const attendeeCounts = processedEvents.reduce((acc, event) => {
    acc[event.id] = event.attendeeCount;
    return acc;
  }, {} as Record<string, number>);

  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge color
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 sm:p-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
        <p className="text-muted-foreground">
          Create, update, and manage your events all in one place.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/protected/events/create">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Create New Event
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center text-muted-foreground text-sm">
            <AlertTriangleIcon className="h-4 w-4 mr-2 text-yellow-500" />
            Use the map view to visualize event locations
          </div>
        </div>
      </div>
      
      {/* Stats and Map Section */}
      <StatsMapWrapper 
        processedEvents={processedEvents}
        publishedEvents={publishedEvents}
        attendeeCounts={attendeeCounts}
        mapComponent={<EventsMapClientWrapper />}
      />
      
      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        {/* All Events Tab */}
        <TabsContent value="all">
          <div className="rounded-md border">
            {processedEvents.map((event, index) => (
              <div key={event.id}>
                {index > 0 && <div className="border-t border-border" />}
                <div className="flex flex-col md:flex-row p-4">
                  <div className="flex-1 md:w-1/3 mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <time dateTime={event.date}>{formatDate(event.date)}</time>
                    </div>
                  </div>
                  <div className="flex-1 md:w-1/4 mb-2 md:mb-0">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{event.location}</div>
                  </div>
                  <div className="flex-1 md:w-1/6 mb-2 md:mb-0">
                    <div className="text-sm text-muted-foreground">Attendees</div>
                    <div className="font-medium">{event.attendeeCount > 0 ? event.attendeeCount : 'N/A'}</div>
                  </div>
                  <div className="flex-none md:w-1/4 flex items-center justify-start md:justify-end gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/protected/events/${event.id}`}>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/protected/events/${event.id}/edit`}>
                        <FileEditIcon className="h-4 w-4 mr-1" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        {/* Published Tab */}
        <TabsContent value="published">
          <div className="rounded-md border">
            {processedEvents
              .filter(event => event.status === 'published')
              .map((event, index, filteredArray) => (
                <div key={event.id}>
                  {index > 0 && <div className="border-t border-border" />}
                  <div className="flex flex-col md:flex-row p-4">
                    <div className="flex-1 md:w-1/3 mb-2 md:mb-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                      </div>
                    </div>
                    <div className="flex-1 md:w-1/4 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                    <div className="flex-1 md:w-1/6 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Attendees</div>
                      <div className="font-medium">{event.attendeeCount}</div>
                    </div>
                    <div className="flex-none md:w-1/4 flex items-center justify-start md:justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/protected/events/${event.id}`}>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/protected/events/${event.id}/edit`}>
                          <FileEditIcon className="h-4 w-4 mr-1" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
        
        {/* Draft Tab */}
        <TabsContent value="draft">
          <div className="rounded-md border">
            {processedEvents
              .filter(event => event.status === 'draft')
              .map((event, index, filteredArray) => (
                <div key={event.id}>
                  {index > 0 && <div className="border-t border-border" />}
                  <div className="flex flex-col md:flex-row p-4">
                    <div className="flex-1 md:w-1/3 mb-2 md:mb-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                      </div>
                    </div>
                    <div className="flex-1 md:w-1/4 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                    <div className="flex-1 md:w-1/6 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Attendees</div>
                      <div className="font-medium">N/A</div>
                    </div>
                    <div className="flex-none md:w-1/4 flex items-center justify-start md:justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/protected/events/${event.id}`}>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/protected/events/${event.id}/edit`}>
                          <FileEditIcon className="h-4 w-4 mr-1" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
        
        {/* Completed Tab */}
        <TabsContent value="completed">
          <div className="rounded-md border">
            {processedEvents
              .filter(event => event.status === 'completed')
              .map((event, index, filteredArray) => (
                <div key={event.id}>
                  {index > 0 && <div className="border-t border-border" />}
                  <div className="flex flex-col md:flex-row p-4">
                    <div className="flex-1 md:w-1/3 mb-2 md:mb-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                      </div>
                    </div>
                    <div className="flex-1 md:w-1/4 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                    <div className="flex-1 md:w-1/6 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Attendees</div>
                      <div className="font-medium">{event.attendeeCount}</div>
                    </div>
                    <div className="flex-none md:w-1/4 flex items-center justify-start md:justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/protected/events/${event.id}`}>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/protected/events/${event.id}/edit`}>
                          <FileEditIcon className="h-4 w-4 mr-1" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
        
        {/* Cancelled Tab */}
        <TabsContent value="cancelled">
          <div className="rounded-md border">
            {processedEvents
              .filter(event => event.status === 'cancelled')
              .map((event, index, filteredArray) => (
                <div key={event.id}>
                  {index > 0 && <div className="border-t border-border" />}
                  <div className="flex flex-col md:flex-row p-4">
                    <div className="flex-1 md:w-1/3 mb-2 md:mb-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                      </div>
                    </div>
                    <div className="flex-1 md:w-1/4 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                    <div className="flex-1 md:w-1/6 mb-2 md:mb-0">
                      <div className="text-sm text-muted-foreground">Attendees</div>
                      <div className="font-medium">N/A</div>
                    </div>
                    <div className="flex-none md:w-1/4 flex items-center justify-start md:justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/protected/events/${event.id}`}>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/protected/events/${event.id}/edit`}>
                          <FileEditIcon className="h-4 w-4 mr-1" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
