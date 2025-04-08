import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { generateQRCodeUrl } from '@/lib/qr-code'

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

// Helper function to ensure valid QR code URL
const ensureValidQrCodeUrl = (url: string | null, eventId: string): string => {
  // If URL is missing or doesn't point to the QR code service
  if (!url || !url.includes('api.qrserver.com')) {
    // Generate a proper QR code URL
    return generateQRCodeUrl({
      event_id: eventId,
      type: 'gallery' // Use gallery type for QR codes
    });
  }
  return url;
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
      padding: '24px',
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      {/* Header section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '8px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            marginBottom: '8px',
            lineHeight: '1.2'
          }}>
            QR Codes
          </h1>
          <p style={{ 
            color: 'var(--muted-foreground)', 
            fontSize: '14px'
          }}>
            Access your event QR codes for easy check-in
          </p>
        </div>
        
        <Button asChild style={{
          height: '40px',
          whiteSpace: 'nowrap'
        }}>
          <Link href="/protected/events/create">
            <Plus style={{ height: '16px', width: '16px', marginRight: '8px' }} />
            Create Event
          </Link>
        </Button>
      </div>
      
      {/* QR Codes section */}
      <div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px',
          width: '100%'
        }}>
          {events && events.length > 0 ? (
            events.map(event => {
              // Ensure the QR code URL is valid
              const validQrCodeUrl = ensureValidQrCodeUrl(event.qr_code_url, event.id);
              
              return (
                <Card key={event.id} style={{ 
                  border: '2px solid var(--border)', 
                  background: 'var(--card)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  margin: '4px'
                }}>
                  <CardHeader style={{ 
                    padding: '16px',
                    borderBottom: '2px solid var(--border)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      gap: '8px' 
                    }}>
                      <CardTitle style={{ 
                        fontSize: '18px', 
                        fontWeight: '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {event.name}
                      </CardTitle>
                      {getStatusBadge(event.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent style={{ 
                    padding: '16px', 
                    flex: '1', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: '200px',
                    backgroundColor: 'var(--background)'
                  }}>
                    <div style={{ 
                      width: '100%', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        width: 'calc(min(100%, 200px))', 
                        height: 'calc(min(100%, 200px))',
                        position: 'relative',
                        background: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '2px solid #e0e0e0'
                      }}>
                        <img 
                          src={validQrCodeUrl} 
                          alt={`QR code for ${event.name}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter style={{ 
                    padding: '12px 16px',
                    borderTop: '2px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                    backgroundColor: 'var(--card)'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <Button size="sm" variant="outline" style={{
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        height: '36px',
                        minWidth: '36px',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          Regenerate
                        </span>
                      </Button>
                      <Button size="sm" variant="outline" style={{
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        height: '36px',
                        minWidth: '36px',
                        backgroundColor: 'transparent',
                        transition: 'all 0.2s ease'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          Download
                        </span>
                      </Button>
                    </div>
                    <Button asChild size="sm" variant="default" style={{
                      borderRadius: '6px',
                      height: '36px',
                      minWidth: '36px',
                      transition: 'all 0.2s ease'
                    }}>
                      <Link href={`/protected/events/${event.id}`}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          Share
                        </span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <Card style={{ 
              border: '1px solid var(--border)', 
              background: 'var(--card)',
              gridColumn: '1 / -1',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <CardContent style={{ padding: '32px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                No events found. Create your first event to generate QR codes.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Information card */}
      <Card style={{ 
        border: '2px solid var(--border)', 
        background: 'var(--card)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <CardHeader style={{ padding: '16px', borderBottom: '2px solid var(--border)' }}>
          <CardTitle style={{ fontSize: '18px', fontWeight: '600' }}>How QR Codes Work</CardTitle>
          <CardDescription style={{ fontSize: '14px' }}>Use these QR codes to streamline your event check-in process</CardDescription>
        </CardHeader>
        <CardContent style={{ padding: '16px' }}>
          <ul style={{ 
            listStyle: 'disc', 
            paddingLeft: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            fontSize: '14px'
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