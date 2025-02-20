import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRole } from '@/types/auth'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Manage your events and photos',
}

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    redirect('/auth/signin')
  }

  const userRole = (session.user.user_metadata.role || 'USER') as UserRole

  // Role-based redirects
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      redirect('/protected/admin')
      break
    case 'EVENT_HOST':
      // Continue to event host dashboard
      break
    case 'USER':
      // Show user dashboard
      break
    case 'GUEST':
      redirect('/event/browse')
      break
  }

  // Get dashboard stats based on role
  const getDashboardStats = async () => {
    const stats = {
      events: 0,
      photos: 0,
      activeEvents: 0,
      guests: 0
    }

    // TODO: Implement stats fetching based on role
    return stats
  }

  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {userRole === 'EVENT_HOST' ? 'Event Dashboard' : 'My Dashboard'}
        </h1>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.guests}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
