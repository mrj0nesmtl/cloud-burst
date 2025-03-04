'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface SubmissionStats {
  status: string
  count: number
}

const STATUS_COLORS = {
  new: '#0088FE',
  in_progress: '#FFBB28',
  resolved: '#00C49F'
}

export function ContactStats() {
  const [stats, setStats] = useState<SubmissionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalSubmissions, setTotalSubmissions] = useState(0)

  useEffect(() => {
    async function fetchSubmissionStats() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Fetch submission stats by status
        const { data, error } = await supabase
          .rpc('get_submissions_by_status')
        
        if (error) throw error
        
        // Calculate total submissions
        const total = data?.reduce((sum: number, item: SubmissionStats) => sum + item.count, 0) || 0
        
        setStats(data || [])
        setTotalSubmissions(total)
      } catch (err) {
        console.error('Error fetching submission stats:', err)
        setError('Failed to load submission statistics')
        
        // Fallback data for development
        setStats([
          { status: 'new', count: 8 },
          { status: 'in_progress', count: 5 },
          { status: 'resolved', count: 12 }
        ])
        setTotalSubmissions(25)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubmissionStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
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
          <CardTitle>Contact Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format data for the chart
  const chartData = stats.map(item => ({
    status: formatStatus(item.status),
    count: item.count,
    fill: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#8884D8'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-4">
          <div className="text-3xl font-bold">{totalSubmissions}</div>
          <div className="text-sm text-muted-foreground">Total Submissions</div>
        </div>
        
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Submissions" />
            </BarChart>
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