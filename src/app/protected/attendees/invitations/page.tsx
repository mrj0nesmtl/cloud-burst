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
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          lineHeight: '1.2', 
          marginBottom: '8px'
        }}>
          All Guest Invitations
        </h1>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--muted-foreground)'
        }}>
          View and manage all invitations across your events
        </p>
      </div>

      <Alert className="my-3 sm:my-4 text-sm">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Recommended Workflow</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          For the best experience, create invitations directly from the specific event page. 
          This ensures guests are properly associated with the correct event.
        </AlertDescription>
      </Alert>

      {/* Apply direct style approach for better mobile layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '16px',
        width: '100%',
        marginBottom: '24px'
      }}>
        <Card style={{ 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          borderRadius: '8px',
          width: '100%'
        }}>
          <CardHeader style={{ padding: '16px' }}>
            <CardTitle style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Quick Access
            </CardTitle>
            <CardDescription style={{ 
              fontSize: '0.875rem',
              color: 'var(--muted-foreground)'
            }}>
              Send invitations from your recent events
            </CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '16px', paddingTop: '0' }}>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentEvents.length > 0 ? (
                recentEvents.map(event => (
                  <li key={event.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '12px',
                    gap: '8px',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarDays style={{ 
                        height: '16px', 
                        width: '16px', 
                        marginRight: '8px', 
                        color: 'var(--muted-foreground)',
                        flexShrink: 0 
                      }} />
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {event.name}
                      </span>
                    </div>
                    <Link href={`/protected/events/${event.id}`} style={{ width: '100%' }} passHref>
                      <Button variant="outline" size="sm" style={{ 
                        height: '44px',
                        width: '100%', 
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 16px'
                      }}>
                        <Mail style={{ height: '14px', width: '14px', marginRight: '8px' }} />
                        Invite Guests
                      </Button>
                    </Link>
                  </li>
                ))
              ) : (
                <li style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--muted-foreground)',
                  padding: '16px',
                  textAlign: 'center' 
                }}>
                  No recent events found
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card style={{ 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          borderRadius: '8px',
          width: '100%'
        }}>
          <CardHeader style={{ padding: '16px' }}>
            <CardTitle style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Guest Management
            </CardTitle>
            <CardDescription style={{ 
              fontSize: '0.875rem',
              color: 'var(--muted-foreground)'
            }}>
              This dashboard shows all invitations across all events
            </CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '16px', paddingTop: '0' }}>
            <p style={{ 
              fontSize: '0.875rem',
              marginBottom: '12px'  
            }}>
              From this page, you can:
            </p>
            <ul style={{ 
              listStyleType: 'disc', 
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.875rem'
            }}>
              <li>View invitation status across all events</li>
              <li>Track RSVPs and guest responses</li>
              <li>Manage existing invitations</li>
              <li>View which guests have viewed their invitations</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-3 sm:my-4" />

      <InvitationsTable invitations={invitations} />
    </Shell>
  )
} 