import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'QR Codes | Cloud Burst',
  description: 'Access your event QR codes',
}

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/20">Draft</Badge>
    case 'published':
      return <Badge variant="default" className="bg-green-500">Published</Badge>
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status || 'Unknown'}</Badge>
  }
}

export default async function QRCodesPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get the user's ID from the session
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all events for the user, including drafts
  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, qr_code_url, status')
    .eq('organizer_id', user?.id)
    .order('created_at', { ascending: false })
  
  // Mock data for demo QR code
  const mockEvent = {
    id: 'demo',
    name: 'Demo Event',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?data=https://cloudburst-demo.example.com/event/demo&size=300x300'
  }
  
  return (
    <div style={{ 
      width: '100%', 
      padding: '1.5rem 1rem',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem' 
    }}>
      {/* Header section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            marginBottom: '0.5rem',
            lineHeight: '1.2'
          }}>
            QR Codes
          </h1>
          <p style={{ 
            color: 'var(--muted-foreground)', 
            fontSize: '0.9rem'
          }}>
            Access your event QR codes for easy check-in
          </p>
        </div>
        
        <Button asChild style={{
          height: '2.5rem',
          whiteSpace: 'nowrap'
        }}>
          <Link href="/protected/events/create">
            <Plus style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} />
            Create Event
          </Link>
        </Button>
      </div>
      
      {/* QR Codes section */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1.5rem'
        }}>
          {events && events.length > 0 ? (
            events.map(event => (
              <Card key={event.id} style={{ 
                border: '1px solid var(--border)', 
                background: 'var(--card)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardHeader style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CardTitle style={{ fontSize: '1.1rem', fontWeight: '600' }}>{event.name}</CardTitle>
                    {getStatusBadge(event.status)}
                  </div>
                </CardHeader>
                <CardContent style={{ padding: '0 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {event.qr_code_url ? (
                    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                      <QRCodeDisplay url={event.qr_code_url} eventId={event.id} />
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '1rem', 
                      border: '1px dashed var(--border)', 
                      borderRadius: '0.5rem',
                      backgroundColor: 'var(--muted)',
                      textAlign: 'center',
                      color: 'var(--muted-foreground)'
                    }}>
                      QR code not available
                    </div>
                  )}
                </CardContent>
                <CardFooter style={{ padding: '0 1rem 1rem', justifyContent: 'center' }}>
                  <Button asChild size="sm" variant="outline" style={{ width: '100%' }}>
                    <Link href={`/protected/events/${event.id}`}>
                      View Event
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card style={{ 
              border: '1px solid var(--border)', 
              background: 'var(--card)',
              gridColumn: '1 / -1'
            }}>
              <CardContent style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                No events found. Create your first event to generate QR codes.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Information card */}
      <Card style={{ 
        border: '1px solid var(--border)', 
        background: 'var(--card)',
        marginTop: '1rem'
      }}>
        <CardHeader>
          <CardTitle>How QR Codes Work</CardTitle>
          <CardDescription>Use these QR codes to streamline your event check-in process</CardDescription>
        </CardHeader>
        <CardContent>
          <ul style={{ 
            listStyle: 'disc', 
            paddingLeft: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem' 
          }}>
            <li>Share the QR code with your event staff for easy check-in</li>
            <li>Attendees can scan the QR code to access event details</li>
            <li>Link directly to your event gallery for instant photo uploads</li>
            <li>QR codes update automatically if you change your event details</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 