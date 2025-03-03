import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EventActions } from '@/components/events/event-actions'
import { AttendeeManagement } from '@/components/events/attendee-management'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { UploadDropzone } from '@/components/gallery/upload-dropzone'
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface EventPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: event } = await supabase
    .from('events')
    .select('name, description')
    .eq('id', params.id)
    .single()
  
  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    }
  }
  
  return {
    title: `${event.name} | Cloud Burst`,
    description: event.description || `Details for ${event.name}`,
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createClient()
  
  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !event) {
    notFound()
  }
  
  // Fetch event attendees
  const { data: attendees } = await supabase
    .from('event_attendees')
    .select('*')
    .eq('event_id', params.id)
  
  // Fetch event photos
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })
  
  // Format event date
  const eventDate = event.date 
    ? format(new Date(event.date), 'PPP') 
    : 'Date not set'
  
  // Determine event status
  const getEventStatus = () => {
    if (event.status) return event.status
    
    const now = new Date()
    const eventDateObj = event.date ? new Date(event.date) : null
    
    if (!eventDateObj) return 'draft'
    if (eventDateObj > now) return 'upcoming'
    if (eventDateObj < now) return 'past'
    
    return 'active'
  }
  
  const eventStatus = getEventStatus()
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'upcoming': return 'bg-blue-500'
      case 'past': return 'bg-gray-500'
      case 'draft': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <Badge variant="outline" className={getStatusColor(eventStatus)}>
              {eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1)}
            </Badge>
            <p className="text-sm text-muted-foreground">{eventDate}</p>
            {event.location && (
              <p className="text-sm text-muted-foreground">{event.location}</p>
            )}
          </div>
        </div>
        
        <EventActions eventId={event.id} organizerId={event.organizer_id} />
      </div>
      
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>About this event</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{event.description}</p>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendees">
            Attendees ({attendees?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="gallery">
            Gallery ({photos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Complete information about this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Date & Time</h3>
                  <p className="text-sm text-muted-foreground">
                    {eventDate}
                    {event.time && ` at ${event.time}`}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.location || 'No location set'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Attendees</h3>
                  <p className="text-sm text-muted-foreground">
                    {attendees?.length || 0} registered
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Photos</h3>
                  <p className="text-sm text-muted-foreground">
                    {photos?.length || 0} uploaded
                  </p>
                </div>
                
                {event.max_attendees && (
                  <div>
                    <h3 className="font-medium">Capacity</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.max_attendees} maximum attendees
                    </p>
                  </div>
                )}
                
                {event.code && (
                  <div>
                    <h3 className="font-medium">Event Code</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.code}
                    </p>
                  </div>
                )}
              </div>
              
              {event.additional_info && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium">Additional Information</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.additional_info}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendees">
          <Card>
            <CardHeader>
              <CardTitle>Manage Attendees</CardTitle>
              <CardDescription>
                View and manage people attending this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendeeManagement 
                eventId={event.id} 
                initialAttendees={attendees || []} 
                organizerId={event.organizer_id}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Event Gallery</CardTitle>
              <CardDescription>
                Photos from this event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UploadDropzone eventId={event.id} />
              
              {photos && photos.length > 0 ? (
                <GalleryGrid photos={photos} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No photos have been uploaded for this event yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle>Event QR Code</CardTitle>
              <CardDescription>
                Share this QR code with attendees for easy check-in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRCodeDisplay 
                eventId={event.id} 
                eventCode={event.code || event.id} 
                eventName={event.name}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
