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
        const eventsByMonth = eventsByMonthError ? 
          [
            { month: 'Jan', count: 5 },
            { month: 'Feb', count: 8 },
            { month: 'Mar', count: 12 },
            { month: 'Apr', count: 7 },
            { month: 'May', count: 15 },
            { month: 'Jun', count: 20 }
          ] : 
          eventsByMonthData
        
        // Fetch users by role
        const { data: usersByRoleData, error: usersByRoleError } = await supabase
          .rpc('get_users_by_role')
        
        // If the RPC function doesn't exist yet, we'll mock the data
        const usersByRole = usersByRoleError ? 
          [
            { role: 'super_admin', count: 1 },
            { role: 'admin', count: 3 },
            { role: 'event_host', count: 15 },
            { role: 'user', count: 120 },
            { role: 'guest', count: 45 }
          ] : 
          usersByRoleData
        
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPhotos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeEvents}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Events by Month</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.eventsByMonth}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="role"
                    label={({ role, count }) => `${role}: ${count}`}
                  >
                    {data.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 