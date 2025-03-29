import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  Clock, 
  ImageIcon, 
  QrCode, 
  UserPlus, 
  Camera, 
  BarChart, 
  Plus,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Image,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Event management dashboard for Cloud Burst',
}

// Fetch dashboard data
async function getDashboardData() {
  const supabase = await createServerClient()
  
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
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Overview</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
              Your event management dashboard
            </p>
          </div>
          <Link href="/protected/events/create">
            <Button size="sm" className="w-full sm:w-auto h-10" style={{ 
              background: 'var(--primary)',
              borderRadius: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Total Events</CardTitle>
              <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalEvents}</div>
              <p className="text-sm text-muted-foreground">Events created</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Total Attendees</CardTitle>
              <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalAttendees}</div>
              <p className="text-sm text-muted-foreground">Event participants</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Active Events</CardTitle>
              <div className="h-8 w-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.activeEvents}</div>
              <p className="text-sm text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-base font-medium">Total Photos</CardTitle>
              <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalPhotos}</div>
              <p className="text-sm text-muted-foreground">Photos uploaded</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content - Charts & Recent Events */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))', 
          gap: '24px',
          marginBottom: '24px' 
        }}>
          {/* Chart Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Event Activity</CardTitle>
                  <CardDescription className="text-sm">
                    Activity over the past year
                  </CardDescription>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div style={{ height: '300px' }}>
                <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                  <OverviewChart />
                </Suspense>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Events Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Events</CardTitle>
                  <CardDescription className="text-sm">
                    Your latest events
                  </CardDescription>
                </div>
                <Link href="/protected/events">
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    View all
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <RecentEvents events={recentEvents} />
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-sm">
                  Common tasks and shortcuts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div style={{ 
              display: 'grid', 
              gap: '16px', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
            }}>
              <Button variant="outline" asChild className="h-auto justify-start px-4 py-3 border-none bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <Link href="/protected/attendees/qr-codes" className="flex items-start">
                  <div className="mr-3 h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">Generate QR Codes</span>
                    <span className="text-xs text-muted-foreground mt-1">Create check-in codes for events</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto justify-start px-4 py-3 border-none bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <Link href="/protected/attendees/manage" className="flex items-start">
                  <div className="mr-3 h-10 w-10 rounded-md bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">Invite Attendees</span>
                    <span className="text-xs text-muted-foreground mt-1">Send invitations to guests</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto justify-start px-4 py-3 border-none bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                <Link href="/protected/gallery/moderate" className="flex items-start">
                  <div className="mr-3 h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">Moderate Photos</span>
                    <span className="text-xs text-muted-foreground mt-1">Review and approve photos</span>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto justify-start px-4 py-3 border-none bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                <Link href="/protected/analytics/engagement" className="flex items-start">
                  <div className="mr-3 h-10 w-10 rounded-md bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">View Analytics</span>
                    <span className="text-xs text-muted-foreground mt-1">Check event performance</span>
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