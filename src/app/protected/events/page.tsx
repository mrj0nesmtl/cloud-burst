import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getUserEventsWithCounts } from '@/lib/supabase/events'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import { Suspense } from 'react'
import { 
  ClientSideFilters, 
  EventList, 
  EventListSkeleton 
} from '@/components/events/event-list-client'

export const metadata: Metadata = {
  title: 'Events | Cloud Burst',
  description: 'Manage your photo events',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EventsPage() {
  // Fetch events with attendee and photo counts
  const events = await getUserEventsWithCounts()
  
  // Group events by status
  const draftEvents = events.filter(event => event.status === 'draft')
  const publishedEvents = events.filter(event => event.status === 'published')
  const completedEvents = events.filter(event => event.status === 'completed')
  const cancelledEvents = events.filter(event => event.status === 'cancelled')
  
  // Get user role from Supabase
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin (for future use)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Create and manage your photo events
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href="/protected/admin/events">
                <Filter className="mr-2 h-4 w-4" />
                All Events
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/protected/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">{events.length}</Badge>
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
          </TabsList>
          
          <ClientSideFilters />
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={events} 
              emptyMessage="No events found. Create your first event to get started."
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="published" className="space-y-4">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={publishedEvents} 
              emptyMessage="No published events found."
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={draftEvents} 
              emptyMessage="No draft events found."
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={completedEvents} 
              emptyMessage="No completed events found."
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
