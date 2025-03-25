import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Mail, AlertCircle } from 'lucide-react'
import { Shell } from '@/components/shell'
import { InvitationsTable } from './components/invitations-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { InvitationWithEvent } from '@/types/invitations'

export const metadata: Metadata = {
  title: 'All Guest Invitations',
  description: 'View and manage all invitations across your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

async function getInvitations() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: invitations, error } = await supabase
    .from('invitations')
    .select(`
      *,
      event:events (
        id,
        name,
        date,
        status
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error)
    return []
  }

  return invitations as InvitationWithEvent[]
}

async function getEvents() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return events
}

export default async function ManageInvitationsPage() {
  const invitations = await getInvitations()
  const recentEvents = await getEvents()

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">All Guest Invitations</h1>
          <p className="text-muted-foreground">
            View and manage all invitations across your events
          </p>
        </div>
      </div>

      <Alert className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recommended Workflow</AlertTitle>
        <AlertDescription>
          For the best experience, create invitations directly from the specific event page. 
          This ensures guests are properly associated with the correct event.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Send invitations from your recent events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentEvents.map(event => (
                <li key={event.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.name}</span>
                  </div>
                  <Link href={`/protected/events/${event.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <Mail className="h-3 w-3 mr-1" />
                      Invite Guests
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Guest Management</CardTitle>
            <CardDescription>
              This dashboard shows all invitations across all events
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <p>
              From this page, you can:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>View invitation status across all events</li>
              <li>Track RSVPs and guest responses</li>
              <li>Manage existing invitations</li>
              <li>View which guests have viewed their invitations</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />

      <InvitationsTable invitations={invitations} />
    </Shell>
  )
} 