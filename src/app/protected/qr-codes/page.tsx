import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { Separator } from '@/components/ui/separator'
import { Download, ExternalLink, Calendar, QrCode } from 'lucide-react'

export const metadata: Metadata = {
  title: 'QR Codes | Cloud Burst',
  description: 'Manage QR codes for your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function QRCodesPage() {
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/qr-codes')

    // Get user's events with QR codes
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        date,
        qr_code_url,
        custom_url,
        status
      `)
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
    
    if (eventsError) throw eventsError
    
    // Filter events with QR codes
    const eventsWithQRCodes = events?.filter(event => event.qr_code_url) || []
    
    // Group events by status
    const activeEvents = eventsWithQRCodes.filter(event => ['published', 'draft'].includes(event.status))
    const archivedEvents = eventsWithQRCodes.filter(event => ['completed', 'cancelled'].includes(event.status))
    
    return (
      <div className="container px-0 py-0 max-w-full">
        <div className="flex flex-col space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
            <p className="text-muted-foreground">
              Manage QR codes for your events
            </p>
          </div>
        </div>
        
        {eventsWithQRCodes.length === 0 ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>No QR Codes Found</CardTitle>
              <CardDescription>
                You don't have any events with QR codes yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-6">
                Create an event to generate a QR code that attendees can scan to access your event gallery.
              </p>
              <Button asChild>
                <Link href="/protected/events/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create New Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="active">Active Events ({activeEvents.length})</TabsTrigger>
              <TabsTrigger value="archived">Archived Events ({archivedEvents.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <CardDescription>
                        {new Date(event.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex justify-center py-4">
                      <QRCodeDisplay 
                        eventId={event.id}
                        eventName={event.name}
                        size={200}
                        title=""
                        description=""
                      />
                    </CardContent>
                    
                    <CardFooter className="flex justify-between bg-muted/50 pt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/protected/events/${event.id}/attendees?tab=qrcode`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Details
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={event.qr_code_url} 
                          download={`event-qr-${event.id}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {activeEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active events with QR codes found.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="archived" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {archivedEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <CardDescription>
                        {new Date(event.date).toLocaleDateString()} • {event.status}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex justify-center py-4">
                      <QRCodeDisplay 
                        eventId={event.id}
                        eventName={event.name}
                        size={200}
                        title=""
                        description=""
                      />
                    </CardContent>
                    
                    <CardFooter className="flex justify-between bg-muted/50 pt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/protected/events/${event.id}/attendees?tab=qrcode`}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Details
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={event.qr_code_url} 
                          download={`event-qr-${event.id}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {archivedEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No archived events with QR codes found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        <Separator className="my-8" />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About QR Codes</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Event QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Generated automatically when you create an event</li>
                  <li>• Can be displayed at your event venue</li>
                  <li>• Allows anyone to access the event gallery</li>
                  <li>• No login required for attendees</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Attendee QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Generated when you send invitations</li>
                  <li>• Unique to each attendee</li>
                  <li>• Can be included in personalized invitations</li>
                  <li>• Tracks individual attendee participation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading QR codes page:', error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h1 className="text-xl font-bold text-destructive mb-2">Error Loading QR Codes</h1>
          <p className="text-muted-foreground">
            There was an error loading your QR codes. Please try again later.
          </p>
        </div>
      </div>
    )
  }
} 