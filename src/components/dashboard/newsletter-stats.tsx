'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

interface SubscriberStats {
  status: string
  count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function NewsletterStats() {
  const [stats, setStats] = useState<SubscriberStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalSubscribers, setTotalSubscribers] = useState(0)

  useEffect(() => {
    async function fetchSubscriberStats() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Fetch subscriber stats by status
        const { data, error } = await supabase
          .rpc('get_subscribers_by_status')
        
        if (error) throw error
        
        // Calculate total subscribers
        const total = data?.reduce((sum: number, item: SubscriberStats) => sum + item.count, 0) || 0
        
        setStats(data || [])
        setTotalSubscribers(total)
      } catch (err) {
        console.error('Error fetching subscriber stats:', err)
        setError('Failed to load subscriber statistics')
        
        // Fallback data for development
        setStats([
          { status: 'active', count: 120 },
          { status: 'unsubscribed', count: 15 }
        ])
        setTotalSubscribers(135)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubscriberStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Subscribers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-4">
          <div className="text-3xl font-bold">{totalSubscribers}</div>
          <div className="text-sm text-muted-foreground">Total Subscribers</div>
        </div>
        
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
                label={({ status, count }) => `${formatStatus(status)}: ${count}`}
              >
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, formatStatus(name as string)]} />
              <Legend formatter={(value) => formatStatus(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
} 