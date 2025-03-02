'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  activity_type: string
  activity_id: string
  activity_title: string
  activity_status: string
  created_at: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .rpc('get_recent_activity', { limit_count: 10 })
        
        if (error) throw error
        
        setActivities(data || [])
      } catch (err) {
        console.error('Error fetching recent activity:', err)
        setError('Failed to load recent activity')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecentActivity()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent activity found</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={`${activity.activity_type}-${activity.activity_id}`}
                className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ActivityTypeIcon type={activity.activity_type} />
                    <span className="font-medium">{activity.activity_title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatActivityType(activity.activity_type)}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ActivityStatusBadge status={activity.activity_status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'event':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-blue-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    case 'registration':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-green-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      )
    case 'submission':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-amber-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    default:
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-gray-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )
  }
}

function ActivityStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'subscribed':
    case 'paid':
      variant = "default"
      break
    case 'pending':
    case 'in_progress':
    case 'processing':
      variant = "secondary"
      break
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'unsubscribed':
      variant = "destructive"
      break
    default:
      variant = "outline"
  }
  
  return <Badge variant={variant}>{formatStatus(status)}</Badge>
}

function formatActivityType(type: string): string {
  switch (type) {
    case 'event':
      return 'Event'
    case 'registration':
      return 'Registration'
    case 'submission':
      return 'Contact Form'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
} 