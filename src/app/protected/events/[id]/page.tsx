import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Mail } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EventActions } from '@/components/events/event-actions'
import { AttendeeManagement } from '@/components/events/attendee-management'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { UploadDropzone } from '@/components/gallery/upload-dropzone'
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { getServerSupabase } from '@/lib/supabase/server'
import { EventStatusSelector } from '@/components/events/event-status-selector'
import { Photo } from '@/types/events'
import { Invitation } from '@/types/invitations'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface EventPageProps {
  params: {
    id: string
  }
}

function convertDatabasePhotoToPhotoType(photo: any, eventId: string): Photo {
  return {
    id: photo.id,
    event_id: photo.event_id || eventId,
    filename: photo.filename || '',
    storage_path: photo.storage_path || '',
    is_approved: Boolean(photo.is_approved),
    metadata: {},  // Initialize with empty object as fallback
    created_at: photo.created_at || new Date().toISOString(),
    updated_at: photo.updated_at || new Date().toISOString(),
    uploaded_by: photo.uploaded_by || null,
    width: photo.width || null,
    height: photo.height || null,
    size: photo.size || 0,
    mime_type: photo.mime_type || '',
    // Optional fields omitted if not present
    ...(photo.url && { url: photo.url }),
    ...(photo.thumbnail_url && { thumbnail_url: photo.thumbnail_url })
  };
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const supabase = await getServerSupabase()
  
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
  const supabase = await getServerSupabase()
  
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
  
  // Fetch event invitations
  const { data: invitations } = await supabase
    .from('invitations')
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
            <EventStatusSelector eventId={event.id} currentStatus={event.status || 'draft'} />
            <p className="text-sm text-muted-foreground">{eventDate}</p>
            {event.location && (
              <p className="text-sm text-muted-foreground">{event.location}</p>
            )}
          </div>
        </div>
        
        <EventActions eventId={event.id} organizerId={event.organizer_id || undefined} />
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
          <TabsTrigger value="invitations">
            Invitations {invitations?.length ? `(${invitations.length})` : ''}
          </TabsTrigger>
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
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full">
                  <tbody className="divide-y">
                    <tr className="divide-x">
                      <td className="p-4 bg-muted/50">
                        <h3 className="font-medium">Date & Time</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {eventDate}
                        </p>
                      </td>
                      <td className="p-4 bg-muted/50">
                        <h3 className="font-medium">Location</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.location || 'No location set'}
                        </p>
                      </td>
                      <td className="p-4 bg-muted/50">
                        <h3 className="font-medium">Capacity</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.max_attendees ? `${event.max_attendees} maximum attendees` : 'Unlimited'}
                        </p>
                      </td>
                    </tr>
                    <tr className="divide-x">
                      <td className="p-4">
                        <h3 className="font-medium">Attendees</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {attendees?.length || 0} registered
                        </p>
                      </td>
                      <td className="p-4">
                        <h3 className="font-medium">Photos</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {photos?.length || 0} uploaded
                        </p>
                      </td>
                      <td className="p-4">
                        <h3 className="font-medium">Custom URL</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.custom_url || 'Not set'}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Only show additional information if description exists */}
              {event.description && event.description.length > 100 && (
                <div className="mt-4">
                  <h3 className="font-medium">Additional Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Manage Invitations</CardTitle>
              <CardDescription>
                Send personalized invitations to guests for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Event Invitations</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Invite guests with personalized emails and unique access links
                    </p>
                  </div>
                  <a 
                    href={`/protected/attendees/invitations/create?eventId=${event.id}`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Invite Guests
                  </a>
                </div>
                <Separator />
                
                {invitations && invitations.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-3 text-left font-medium">Guest</th>
                          <th className="p-3 text-left font-medium">Email</th>
                          <th className="p-3 text-left font-medium">Status</th>
                          <th className="p-3 text-left font-medium">Sent</th>
                          <th className="p-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invitations.map((invitation: Invitation) => (
                          <tr key={invitation.id} className="hover:bg-muted/50">
                            <td className="p-3">{invitation.name}</td>
                            <td className="p-3">{invitation.email}</td>
                            <td className="p-3">
                              <Badge variant={invitation.status === 'accepted' ? 'success' : 
                                invitation.status === 'declined' ? 'destructive' : 'secondary'}>
                                {invitation.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {invitation.sent_at ? format(new Date(invitation.sent_at), 'MMM d, yyyy') : 'Not sent'}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <button className="text-xs text-primary hover:underline">Resend</button>
                                <button className="text-xs text-destructive hover:underline">Cancel</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      All invitations for this event will appear here.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Click "Invite Guests" to send personalized invitations.
                    </p>
                    <div className="mt-4 p-4 bg-muted rounded-md max-w-md mx-auto text-left">
                      <h4 className="font-medium text-sm">How invitations work:</h4>
                      <ol className="mt-2 text-sm text-muted-foreground space-y-1 pl-5 list-decimal">
                        <li>Create single invitations or upload a CSV file with multiple guests</li>
                        <li>Each guest receives a personalized email with a unique access link</li>
                        <li>Guests can RSVP and access the event without creating an account</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
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
                organizerId={event.organizer_id || undefined}
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
                <GalleryGrid 
                  photos={photos.map(photo => convertDatabasePhotoToPhotoType(photo, event.id))}
                  showEventName={false} 
                />
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
                eventName={event.name}
                type="event"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
