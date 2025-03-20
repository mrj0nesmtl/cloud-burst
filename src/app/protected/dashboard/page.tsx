import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Clock, ImageIcon, QrCode, UserPlus, Camera, BarChart, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Event management dashboard for Cloud Burst',
}

// Fetch dashboard data
async function getDashboardData() {
  const supabase = createServerClient()
  
  try {
    // Fetch all required data concurrently
    const [
      eventsCount,
      attendeesCount,
      photosCount,
      activeEventsCount,
      { data: recentEvents },
    ] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('event_attendees').select('*', { count: 'exact', head: true }),
      supabase.from('photos').select('*', { count: 'exact', head: true }),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('events')
        .select(`
          id,
          name,
          date,
          event_attendees(count),
          photos(count)
        `)
        .order('date', { ascending: false })
        .limit(5),
    ])

    const transformedEvents = recentEvents?.map((event) => ({
      id: event.id,
      name: event.name,
      date: event.date,
      attendeeCount: event.event_attendees?.[0]?.count ?? 0,
      photoCount: event.photos?.[0]?.count ?? 0,
    })) ?? []

    return {
      stats: {
        totalEvents: eventsCount.count ?? 0,
        totalAttendees: attendeesCount.count ?? 0,
        totalPhotos: photosCount.count ?? 0,
        activeEvents: activeEventsCount.count ?? 0,
      },
      recentEvents: transformedEvents,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

export default async function DashboardPage() {
  const { stats, recentEvents } = await getDashboardData()

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <DashboardHeader />
      
      <div style={{ width: '100%', padding: '16px', flex: '1 1 auto' }}>
        {/* Header and Create Event Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Overview</h1>
          <Button size="sm" className="w-full sm:w-auto" style={{ height: '36px' }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
              <CardTitle className="text-xs font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="text-xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Events created</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
              <CardTitle className="text-xs font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="text-xl font-bold">{stats.totalAttendees}</div>
              <p className="text-xs text-muted-foreground">Event participants</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
              <CardTitle className="text-xs font-medium">Active Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="text-xl font-bold">{stats.activeEvents}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
              <CardTitle className="text-xs font-medium">Total Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="py-2 px-3">
              <div className="text-xl font-bold">{stats.totalPhotos}</div>
              <p className="text-xs text-muted-foreground">Photos uploaded</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content - Charts & Recent Events */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          {/* Chart Card */}
          <Card className="mb-4">
            <CardHeader className="py-3 px-3">
              <CardTitle className="text-base">Event Activity</CardTitle>
              <CardDescription className="text-xs">Activity over the past year</CardDescription>
            </CardHeader>
            <CardContent className="px-1 pb-3">
              <div style={{ height: '220px' }}>
                <OverviewChart />
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Events Card */}
          <Card className="mb-4">
            <CardHeader className="py-3 px-3">
              <CardTitle className="text-base">Recent Events</CardTitle>
              <CardDescription className="text-xs">Your latest events</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <RecentEvents events={recentEvents} />
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="py-3 px-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr' }}>
              <Button variant="outline" asChild className="h-auto w-full justify-start px-3 py-2">
                <Link href="/protected/attendees/qr-codes" className="flex items-start">
                  <QrCode className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium">Generate QR Codes</span>
                    <span className="text-[10px] text-muted-foreground">Create check-in codes for events</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto w-full justify-start px-3 py-2">
                <Link href="/protected/attendees/manage" className="flex items-start">
                  <UserPlus className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium">Invite Attendees</span>
                    <span className="text-[10px] text-muted-foreground">Send invitations to guests</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto w-full justify-start px-3 py-2">
                <Link href="/protected/gallery/moderate" className="flex items-start">
                  <Camera className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium">Moderate Photos</span>
                    <span className="text-[10px] text-muted-foreground">Review and approve photos</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto w-full justify-start px-3 py-2">
                <Link href="/protected/analytics/events" className="flex items-start">
                  <BarChart className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium">View Analytics</span>
                    <span className="text-[10px] text-muted-foreground">Check event performance</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 