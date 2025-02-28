import { Metadata } from 'next'
import { RoleGuard } from '@/components/auth/role-guard'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogViewer } from './components/audit-log-viewer'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/server-config'
import { Users, Camera, Calendar, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Cloud Burst',
  description: 'Platform administration and management',
}

// Stats component with loading state
async function StatsCards() {
  const supabase = createClient()

  // Fetch stats
  const [
    { count: userCount },
    { count: eventCount },
    { count: photoCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('photos').select('*', { count: 'exact', head: true })
  ])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventCount ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
          <Camera className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{photoCount ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Active</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Quick Actions Section
function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <a href="/protected/admin/users" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">Manage Users</h3>
          </div>
          <p className="text-sm text-muted-foreground">View and manage user accounts</p>
        </a>

        <a href="/protected/admin/events" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">Manage Events</h3>
          </div>
          <p className="text-sm text-muted-foreground">Create and manage events</p>
        </a>

        <a href="/protected/admin/photos" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <h3 className="font-semibold">Photo Library</h3>
          </div>
          <p className="text-sm text-muted-foreground">Manage uploaded photos</p>
        </a>

        <a href="/protected/admin/settings" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h3 className="font-semibold">Settings</h3>
          </div>
          <p className="text-sm text-muted-foreground">Configure system settings</p>
        </a>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Platform Administration</h1>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <StatsCards />
        </Suspense>
        
        <QuickActions />

        <AuditLogViewer />
      </div>
    </RoleGuard>
  )
}
