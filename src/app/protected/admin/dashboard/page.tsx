import { Metadata } from 'next'
import { AnalyticsOverview } from '@/components/dashboard/analytics-overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Cloud Burst',
  description: 'Admin dashboard for Cloud Burst platform',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here you can view platform analytics and recent activity.
        </p>
      </div>
      
      <AnalyticsOverview />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <div className="space-y-6">
          {/* Additional dashboard widgets can be added here */}
        </div>
      </div>
    </div>
  )
} 