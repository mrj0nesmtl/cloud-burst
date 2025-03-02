import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserRole } from '@/types/auth'
import { headers } from 'next/headers'

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

    const userRole = (profile?.role || 'USER') as UserRole

    // Only redirect super admins and admins if they specifically need to be in their admin dashboard
    if ((userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && 
        profile?.preferences?.defaultView === 'admin') {
      redirect('/protected/admin')
    }

    // Get dashboard stats based on role
    const stats = await getDashboardStats(supabase, session.user.id, userRole)

    // Return the dashboard UI
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.email || session.user.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Account Details</h2>
            <div className="space-y-2">
              <p>Role: {profile.role}</p>
              <p>ID: {profile.id}</p>
              <p>Last Updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userRole === 'EVENT_HOST' ? 'Your Events' : 'Events Joined'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.events}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.photos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
            </CardContent>
          </Card>

          {userRole === 'EVENT_HOST' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.guests}</div>
              </CardContent>
            </Card>
          )}
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

// Moved stats fetching to a separate function for cleaner code
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
    const [eventsCount, activeCount, photosCount, guestsCount] = await Promise.all([
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq(userRole === 'USER' ? 'created_by' : 'id', userId),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq(userRole === 'USER' ? 'created_by' : 'id', userId)
        .eq('status', 'active'),
      supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      userRole === 'EVENT_HOST' 
        ? supabase
            .from('event_guests')
            .select('*', { count: 'exact', head: true })
            .eq('event_creator_id', userId)
        : { count: 0 }
    ])

    stats.events = eventsCount.count ?? 0
    stats.activeEvents = activeCount.count ?? 0
    stats.photos = photosCount.count ?? 0
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
