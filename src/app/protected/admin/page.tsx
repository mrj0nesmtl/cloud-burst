import { Metadata } from 'next'
import { RoleGuard } from '@/components/auth/role-guard'
import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogViewer } from './components/audit-log-viewer'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Users, Camera, Calendar, Settings, Bell, FileText, Mail } from 'lucide-react'
import { AnalyticsOverview } from '@/components/dashboard/analytics-overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { NewsletterStats } from '@/components/dashboard/newsletter-stats'
import { ContactStats } from '@/components/dashboard/contact-stats'
import { Button } from '@/components/ui/button'
import { getEventActivityData } from '@/lib/data/activity'
import { OverviewChart } from '@/components/dashboard/overview-chart'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Cloud Burst',
  description: 'Platform administration and management',
}

// Stats component with loading state
async function StatsCards() {
  // Server-side auth check - await the client creation
  const supabase = await createServerClient()

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

// Dashboard Header with Actions
function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Platform Administration</h1>
        <p className="text-muted-foreground">Manage your platform, users, and content</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
        <Button variant="default" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
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

        <a href="/protected/admin/newsletter" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <h3 className="font-semibold">Newsletter</h3>
          </div>
          <p className="text-sm text-muted-foreground">Manage newsletter subscribers</p>
        </a>

        <a href="/protected/admin/contacts" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold">Contact Forms</h3>
          </div>
          <p className="text-sm text-muted-foreground">View contact form submissions</p>
        </a>

        <a href="/protected/admin/events" className="group block space-y-2 rounded-lg border p-4 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">Events</h3>
          </div>
          <p className="text-sm text-muted-foreground">Manage platform events</p>
        </a>
      </CardContent>
    </Card>
  )
}

async function ActivityOverview() {
  const data = await getEventActivityData()
  return <OverviewChart data={data} />
}

export default async function AdminDashboardPage() {
  // Server-side auth check - await the client creation
  const supabase = await createServerClient()
  
  // Get and validate session
  const { data, error } = await supabase.auth.getSession()
  
  if (error || !data.session) {
    redirect('/auth/signin')
  }

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin']}>
      <div style={{ width: '100%', padding: '24px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '24px' }}>
          <DashboardHeader />
        </div>
        
        {/* Stats Section */}
        <div style={{ marginBottom: '24px' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <StatsCards />
          </Suspense>
        </div>
        
        {/* Quick Actions Section */}
        <div style={{ marginBottom: '24px' }}>
          <QuickActions />
        </div>

        {/* Analytics Grid */}
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(7, 1fr)' }} className="md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-2 lg:col-span-5">
            <AnalyticsOverview />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ marginTop: '24px', display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(2, 1fr)' }} className="md:grid-cols-2">
          <NewsletterStats />
          <ContactStats />
        </div>

        {/* Audit Log */}
        <div style={{ marginTop: '24px' }}>
          <AuditLogViewer logs={[]} />
        </div>

        {/* Activity Overview */}
        <div style={{ marginTop: '24px' }}>
          <Suspense fallback={<OverviewChart data={[]} isLoading={true} />}>
            <ActivityOverview />
          </Suspense>
        </div>
      </div>
    </RoleGuard>
  )
}
