import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getUserEventsWithCounts } from '@/lib/supabase/events.server'
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
  
  // Add debugging logs
  console.log('[Events Page] Auth Check:', {
    userId: user?.id,
    userEmail: user?.email,
    metadata: user?.user_metadata,
    timestamp: new Date().toISOString()
  })
  
  // Check if user is admin (for future use)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()
  
  // Add role verification logs
  console.log('[Events Page] Role Check:', {
    profileRole: profile?.role,
    isAdmin: profile?.role === 'super_admin' || profile?.role === 'admin',
    timestamp: new Date().toISOString()
  })
  
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  
  return (
    <div style={{ 
      width: '100%', 
      padding: '24px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          lineHeight: '1.2'
        }}>Events</h1>
        <p style={{ 
          color: 'var(--muted-foreground)',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          Create and manage your photo events
        </p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {isAdmin && (
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/protected/admin/events">
              <Filter className="mr-2 h-4 w-4" />
              All Events
            </Link>
          </Button>
        )}
        <Button asChild className="w-full sm:w-auto">
          <Link href="/protected/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <div style={{
          overflowX: 'auto',
          width: '100%',
          paddingBottom: '8px',
          marginBottom: '8px'
        }}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">
              All
              <Badge variant="secondary" className="ml-2">{events.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="published" className="flex-1 sm:flex-initial">
              Published
              <Badge variant="secondary" className="ml-2">{publishedEvents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="draft" className="flex-1 sm:flex-initial">
              Draft
              <Badge variant="secondary" className="ml-2">{draftEvents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-initial">
              Completed
              <Badge variant="secondary" className="ml-2">{completedEvents.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ClientSideFilters />
        
        <TabsContent value="all" className="mt-6">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={events} 
              emptyMessage="No events found. Create your first event to get started."
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="published" className="mt-6">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={publishedEvents} 
              emptyMessage="No published events found."
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          <Suspense fallback={<EventListSkeleton />}>
            <EventList 
              events={draftEvents} 
              emptyMessage="No draft events found."
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
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
