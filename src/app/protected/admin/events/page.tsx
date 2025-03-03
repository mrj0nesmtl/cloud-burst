import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { CalendarDays, MapPin, Users, Image, Search, Filter, User } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'All Events | Admin | Cloud Burst',
  description: 'Manage all events in the system',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminEventsPage() {
  // Get user role from Supabase
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  
  // Redirect if not admin
  if (!isAdmin) {
    redirect('/protected/dashboard')
  }
  
  // Fetch all events with organizer info
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      profiles:organizer_id (
        id,
        email,
        full_name
      ),
      attendees:event_attendees (count),
      photos (count)
    `)
    .order('created_at', { ascending: false })
  
  // Transform data to include counts
  const eventsWithCounts = events?.map(event => ({
    ...event,
    attendees_count: event.attendees?.[0]?.count || 0,
    photos_count: event.photos?.[0]?.count || 0,
    organizer: event.profiles
  })) || []
  
  // Group events by status
  const draftEvents = eventsWithCounts.filter(event => event.status === 'draft')
  const publishedEvents = eventsWithCounts.filter(event => event.status === 'published')
  const completedEvents = eventsWithCounts.filter(event => event.status === 'completed')
  const cancelledEvents = eventsWithCounts.filter(event => event.status === 'cancelled')
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Events</h1>
          <p className="text-muted-foreground">
            Admin view of all events in the system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-[200px] sm:w-[300px] pl-8"
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">{eventsWithCounts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published
            <Badge variant="secondary" className="ml-2">{publishedEvents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft
            <Badge variant="secondary" className="ml-2">{draftEvents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">{completedEvents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            <Badge variant="secondary" className="ml-2">{cancelledEvents.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <AdminEventList events={eventsWithCounts} />
        </TabsContent>
        
        <TabsContent value="published" className="space-y-4">
          <AdminEventList events={publishedEvents} />
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          <AdminEventList events={draftEvents} />
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <AdminEventList events={completedEvents} />
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          <AdminEventList events={cancelledEvents} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminEventList({ events }: { events: any[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-8">No events found in this category.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  <Link href={`/protected/events/${event.id}`} className="hover:text-blue-500 transition-colors">
                    {event.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <CalendarDays className="mr-1 h-3.5 w-3.5" />
                  {formatDate(event.date)}
                  {event.location && (
                    <>
                      <span className="mx-1">•</span>
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      {event.location}
                    </>
                  )}
                </CardDescription>
              </div>
              <StatusBadge status={event.status} />
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {event.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-sm">
                <User className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {event.organizer?.full_name || event.organizer?.email || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.attendees_count}</span>
                <span className="text-muted-foreground ml-1">attendees</span>
              </div>
              <div className="flex items-center text-sm">
                <Image className="mr-1.5 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.photos_count}</span>
                <span className="text-muted-foreground ml-1">photos</span>
              </div>
              <div className="flex items-center text-sm">
                {event.is_public ? (
                  <span className="text-green-500 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">Public</span>
                ) : (
                  <span className="text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">Private</span>
                )}
              </div>
            </div>
          </CardContent>
          <div className="border-t px-6 py-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event.id}/gallery`}>
                View Gallery
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/protected/events/${event.id}`}>
                Manage Event
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-500">Published</Badge>
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    case 'completed':
      return <Badge className="bg-blue-500">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return null
  }
} 