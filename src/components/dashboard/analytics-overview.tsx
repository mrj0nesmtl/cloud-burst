'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AnalyticsData {
  totalEvents: number
  totalUsers: number
  totalPhotos: number
  activeEvents: number
  eventsByMonth: Array<{
    month: string
    count: number
  }>
  usersByRole: Array<{
    role: string
    count: number
  }>
}

interface EventsByMonth {
  month: string
  count: number
}

interface UsersByRole {
  role: string
  count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Fetch total events
        const { count: totalEvents, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
        
        if (eventsError) throw eventsError
        
        // Fetch total users
        const { count: totalUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        
        if (usersError) throw usersError
        
        // Fetch total photos
        const { count: totalPhotos, error: photosError } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
        
        if (photosError) throw photosError
        
        // Fetch active events
        const { count: activeEvents, error: activeEventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
        
        if (activeEventsError) throw activeEventsError
        
        // Fetch events by month
        const { data: eventsByMonthData, error: eventsByMonthError } = await supabase
          .rpc('get_events_by_month')
        
        // If the RPC function doesn't exist yet, we'll mock the data
        const eventsByMonth: EventsByMonth[] = eventsByMonthError ? 
          [
            { month: 'Jan', count: 5 },
            { month: 'Feb', count: 8 },
            { month: 'Mar', count: 12 },
            { month: 'Apr', count: 7 },
            { month: 'May', count: 15 },
            { month: 'Jun', count: 20 }
          ] : 
          (eventsByMonthData as EventsByMonth[])
        
        // Fetch users by role
        const { data: usersByRoleData, error: usersByRoleError } = await supabase
          .rpc('get_users_by_role')
        
        // If the RPC function doesn't exist yet, we'll mock the data
        const usersByRole: UsersByRole[] = usersByRoleError ? 
          [
            { role: 'super_admin', count: 1 },
            { role: 'admin', count: 3 },
            { role: 'event_host', count: 15 },
            { role: 'user', count: 120 },
            { role: 'guest', count: 45 }
          ] : 
          (usersByRoleData as UsersByRole[])
        
        setData({
          totalEvents: totalEvents || 0,
          totalUsers: totalUsers || 0,
          totalPhotos: totalPhotos || 0,
          activeEvents: activeEvents || 0,
          eventsByMonth,
          usersByRole
        })
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-[240px] md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight">{data.totalEvents.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="min-w-[240px] md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight">{data.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="min-w-[240px] md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight">{data.totalPhotos.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="min-w-[240px] md:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold tracking-tight">{data.activeEvents.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 lg:w-auto">
          <TabsTrigger value="events" className="text-sm sm:text-base">Events</TabsTrigger>
          <TabsTrigger value="users" className="text-sm sm:text-base">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Events by Month</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[400px] p-4 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.eventsByMonth}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={30} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[400px] p-4 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="role"
                    label={({ role, count }) => `${role}: ${count.toLocaleString()}`}
                  >
                    {data.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 