import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/components/dashboard/overview'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createServerClient } from '@/lib/supabase/client'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Event management dashboard',
}

// Fetch dashboard data
async function getDashboardData() {
  const supabase = await createServerClient()
  
  // Fetch stats
  const [
    { count: totalEvents },
    { count: totalAttendees },
    { count: totalPhotos },
    { count: activeEvents }
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('event_attendees').select('*', { count: 'exact', head: true }),
    supabase.from('photos').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'active')
  ])

  // Fetch recent events
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      name,
      date,
      event_attendees(count),
      photos(count)
    `)
    .order('date', { ascending: false })
    .limit(5)

  // Transform events data to match RecentEvents component props
  const transformedEvents = events?.map(event => ({
    id: event.id,
    title: event.name,
    date: event.date,
    attendeeCount: event.event_attendees?.[0]?.count || 0,
    photoCount: event.photos?.[0]?.count || 0
  })) || []

  return {
    stats: {
      totalEvents: totalEvents || 0,
      totalAttendees: totalAttendees || 0,
      totalPhotos: totalPhotos || 0,
      activeEvents: activeEvents || 0
    },
    events: transformedEvents
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">
              Welcome to your event management dashboard
            </p>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ marginBottom: '24px' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardStats {...data.stats} />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(7, 1fr)' }} className="md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Chart - Takes up more space */}
        <div className="md:col-span-2 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>
        </div>

        {/* Recent Events - Takes up less space */}
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentEvents events={data.events} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 