'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Download, RefreshCw } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  name: string | null
  status: string
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}

export function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  async function fetchSubscribers() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setSubscribers(data || [])
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      setError('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  async function updateSubscriberStatus(id: string, status: string) {
    try {
      const supabase = createClient()
      
      const updates: Record<string, any> = { 
        status,
        updated_at: new Date().toISOString()
      }
      
      // If status is 'unsubscribed', set unsubscribed_at
      if (status === 'unsubscribed') {
        updates.unsubscribed_at = new Date().toISOString()
      }
      
      // If status is 'subscribed', clear unsubscribed_at
      if (status === 'subscribed') {
        updates.unsubscribed_at = null
      }
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, ...updates } : sub
        )
      )
      
      toast.success(`Subscriber status updated to ${status}`)
    } catch (err) {
      console.error('Error updating subscriber:', err)
      toast.error('Failed to update subscriber status')
    }
  }

  async function exportSubscribers() {
    try {
      // Filter only active subscribers
      const activeSubscribers = subscribers.filter(sub => sub.status === 'subscribed')
      
      // Create CSV content
      const headers = ['Email', 'Name', 'Subscribed At']
      const csvContent = [
        headers.join(','),
        ...activeSubscribers.map(sub => [
          sub.email,
          sub.name || '',
          format(new Date(sub.subscribed_at), 'yyyy-MM-dd')
        ].join(','))
      ].join('\n')
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Subscribers exported successfully')
    } catch (err) {
      console.error('Error exporting subscribers:', err)
      toast.error('Failed to export subscribers')
    }
  }

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

  if (error) {
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Newsletter Subscribers</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSubscribers}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportSubscribers}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {subscribers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No subscribers found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed At</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{subscriber.name || '-'}</TableCell>
                    <TableCell>
                      <SubscriberStatusBadge status={subscriber.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscriber.status === 'subscribed' ? (
                            <DropdownMenuItem
                              onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                            >
                              Mark as Unsubscribed
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => updateSubscriberStatus(subscriber.id, 'subscribed')}
                            >
                              Mark as Subscribed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => updateSubscriberStatus(subscriber.id, 'blocked')}
                          >
                            Block Subscriber
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriberStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  
  switch (status) {
    case 'subscribed':
      variant = "default"
      break
    case 'unsubscribed':
      variant = "secondary"
      break
    case 'blocked':
      variant = "destructive"
      break
    default:
      variant = "outline"
  }
  
  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
} 