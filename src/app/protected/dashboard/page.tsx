import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/types/auth'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

// Import our new components
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Manage your events and photos',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function DashboardPage() {
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/dashboard')

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) throw profileError
    if (!profile) throw new Error('Profile not found')

    const userRole = (profile?.role || 'user') as UserRole

    // Only redirect super admins and admins if they specifically need to be in their admin dashboard
    if ((userRole === 'super_admin' || userRole === 'admin') && 
        profile?.preferences?.defaultView === 'admin') {
      redirect('/protected/admin')
    }

    // Get dashboard stats and data
    const stats = await getDashboardStats(supabase, session.user.id, userRole)
    const recentEvents = await getRecentEvents(supabase, session.user.id, userRole)
    const recentActivities = await getRecentActivities(supabase, session.user.id, userRole)

    // Return the dashboard UI
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.full_name || profile.email || session.user.email}
            </p>
          </div>
          <Button asChild>
            <Link href="/protected/events/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Event
            </Link>
          </Button>
        </div>

        {/* Dashboard stats */}
        <DashboardStats 
          totalEvents={stats.events}
          totalAttendees={stats.guests}
          totalPhotos={stats.photos}
          activeEvents={stats.activeEvents}
        />

        {/* Main content grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <RecentEvents events={recentEvents} />
          </div>
          <div className="space-y-6 pr-2">
            <ActivityFeed activities={recentActivities} />
            <QuickActions />
          </div>
        </div>
      </div>
    )

  } catch (error) {
    console.error('Dashboard error:', error)
    
    // Return error UI instead of redirecting
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">Please try refreshing the page. If the problem persists, try signing out and back in.</p>
        </div>
      </div>
    )
  }
}

// Get dashboard stats
async function getDashboardStats(
  supabase: any, 
  userId: string, 
  userRole: UserRole
) {
  try {
    const stats = {
      events: 0,
      photos: 0,
      activeEvents: 0,
      guests: 0
    }

    // Fetch counts in parallel for better performance
    const [eventsCount, photosCount, activeEventsCount, guestsCount] = await Promise.all([
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', userId),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active'),
      supabase
        .from('event_participants')
        .select('event_id', { count: 'exact', head: true })
        .in('event_id', supabase
          .from('events')
          .select('id')
          .eq('user_id', userId))
    ])

    // Set the stats based on the query results
    stats.events = eventsCount.count ?? 0
    stats.photos = photosCount.count ?? 0
    stats.activeEvents = activeEventsCount.count ?? 0
    stats.guests = guestsCount.count ?? 0

    return stats
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      events: 0,
      photos: 0,
      activeEvents: 0,
      guests: 0
    }
  }
}

// Get recent events for the dashboard
async function getRecentEvents(supabase: any, userId: string, userRole: UserRole) {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        created_at
      `)
      .eq('user_id', userId)
      .order('event_date', { ascending: false })
      .limit(3)
    
    if (error) throw error

    // Format the events for the UI
    const formattedEvents = await Promise.all(events.map(async (event: any) => {
      // Get attendee count
      const { count: attendeeCount } = await supabase
        .from('event_participants')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
      
      // Get photo count
      const { count: photoCount } = await supabase
        .from('photos')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
      
      return {
        id: event.id,
        title: event.title,
        date: event.event_date || event.created_at,
        attendeeCount: attendeeCount || 0,
        photoCount: photoCount || 0
      }
    }))

    return formattedEvents
  } catch (error) {
    console.error('Error fetching recent events:', error)
    return []
  }
}

// Get recent activities for the dashboard
async function getRecentActivities(supabase: any, userId: string, userRole: UserRole) {
  try {
    // In a real app, you would fetch actual activities from a database table
    // For demo purposes, we'll create some sample activities
    const mockActivities = [
      {
        id: '1',
        type: 'photo' as const,
        content: '5 new photos pending review',
        eventId: 'event-1',
        eventName: 'Summer Wedding 2025',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        type: 'rsvp' as const,
        content: '3 new attendees RSVP\'d',
        eventId: 'event-2',
        eventName: 'Corporate Retreat',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
      },
      {
        id: '3',
        type: 'comment' as const,
        content: 'New comment on event page',
        eventId: 'event-1',
        eventName: 'Summer Wedding 2025',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
      },
      {
        id: '4',
        type: 'system' as const,
        content: 'Subscription renews in 12 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() // 6 hours ago
      }
    ]

    return mockActivities
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}
