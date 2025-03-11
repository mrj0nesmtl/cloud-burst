import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AttendeeManagement } from '@/components/events/attendee-management'
import { InvitationForm } from '@/components/attendees/invitation-form'
import { QRCodeDisplay } from '@/components/events/qr-code-display'

export const metadata: Metadata = {
  title: 'Manage Attendees | Cloud Burst',
  description: 'Manage attendees and send invitations',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default async function EventAttendeesPage({ params, searchParams }: PageProps) {
  const { id } = params
  const defaultTab = searchParams.tab || 'attendees'
  
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) throw new Error('Unauthorized')

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (eventError) throw eventError
    if (!event) return notFound()
    
    // Check if user is authorized to manage this event
    if (event.user_id !== session.user.id) {
      throw new Error('Unauthorized')
    }
    
    // Get attendees
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false })
    
    if (attendeesError) throw attendeesError
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Attendees</h1>
          <p className="text-muted-foreground">
            Manage attendees and send invitations for {event.name}
          </p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="invitations">Send Invitations</TabsTrigger>
            <TabsTrigger value="qrcode">Event QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendee Management</CardTitle>
                <CardDescription>
                  View and manage attendees for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendeeManagement 
                  eventId={id} 
                  initialAttendees={attendees || []} 
                  organizerId={session.user.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Invitations</CardTitle>
                <CardDescription>
                  Send invitations with personalized QR codes to attendees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvitationForm 
                  eventId={id} 
                  eventName={event.name}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="qrcode" className="space-y-6">
            <div className="max-w-md mx-auto">
              <QRCodeDisplay 
                eventId={id}
                eventName={event.name}
                title={`${event.name} QR Code`}
                description="Share this QR code to allow attendees to access the event gallery"
                size={300}
              />
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">How to use this QR code</h3>
                <Separator className="my-4" />
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Print this QR code and display it at your event</li>
                  <li>• Include it in digital or printed event materials</li>
                  <li>• Attendees can scan it to access the event gallery</li>
                  <li>• No account required for attendees to view and upload photos</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error('Error loading event attendees page:', error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Attendees</h1>
          <p className="text-muted-foreground">
            There was an error loading the attendees for this event. Please try again later.
          </p>
        </div>
      </div>
    )
  }
} 