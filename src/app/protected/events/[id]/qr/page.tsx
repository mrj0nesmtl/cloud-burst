import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Printer, Share2, Download, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Event QR Code | Cloud Burst',
  description: 'QR code for your event',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EventQRCodePage({ params }: PageProps) {
  const { id } = params
  
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) notFound()
  
  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!event) notFound()
  
  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event QR Code</h1>
          <p className="text-muted-foreground mt-1">
            QR code for {event.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/protected/events/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QR Code Card */}
        <Card className="lg:col-span-5 border">
          <CardHeader className="pb-2">
            <CardTitle>Event QR Code</CardTitle>
            <CardDescription>
              Scan to access the event gallery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 mb-4 bg-black text-white">
              <div className="text-lg font-medium mb-2">{event.name} QR Code</div>
              <div className="text-sm text-gray-300 mb-4">Scan this code to access the event gallery</div>
              <div className="flex justify-center">
                <QRCodeDisplay 
                  eventId={id}
                  eventName={event.name}
                  size={280}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="secondary" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Usage Instructions */}
        <div className="lg:col-span-7">
          <Card className="border h-full">
            <CardHeader className="pb-2">
              <CardTitle>How to Use This QR Code</CardTitle>
              <CardDescription>
                Tips for maximizing engagement with your event QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-6 bg-blue-50/10 hover:bg-blue-50/20 transition-colors">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                      <Printer className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="font-medium text-base mb-3">Display at Event</h3>
                    <p className="text-sm text-muted-foreground">
                      Print and place at entrances, photo booths, and tables.
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 bg-blue-50/10 hover:bg-blue-50/20 transition-colors">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                      <Share2 className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="font-medium text-base mb-3">Include in Materials</h3>
                    <p className="text-sm text-muted-foreground">
                      Add to programs, invitations, and digital communications.
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 bg-blue-50/10 hover:bg-blue-50/20 transition-colors">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                      <Download className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="font-medium text-base mb-3">Easy Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Attendees can scan to instantly access the event gallery.
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6 bg-blue-50/10 hover:bg-blue-50/20 transition-colors">
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
                      <Info className="h-7 w-7 text-blue-400" />
                    </div>
                    <h3 className="font-medium text-base mb-3">No Account Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Anyone can view and upload photos without registration.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-blue-800 bg-blue-950/50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-900 mr-4 flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-300 mb-2">Pro Tip</h3>
                    <p className="text-sm text-blue-400">
                      For maximum engagement, announce the QR code during your event and explain how attendees can use it to view and share photos. Consider offering a small incentive for those who upload photos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 