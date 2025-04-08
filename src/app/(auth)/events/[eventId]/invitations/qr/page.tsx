'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getEventById } from '@/lib/supabase/events'
import { getInvitationsByEventId } from '@/lib/supabase/invitations'
import { EventInvitationQR } from '@/components/events/event-invitation-qr'
import Link from 'next/link'
import { Plus, Download, QrCode, ArrowRight } from 'lucide-react'
import { Invitation } from '@/types/invitations'
import { Skeleton } from '@/components/ui/skeleton'
import { useLegacyQuery } from '@/lib/query-helpers'

export default function EventQRCodesPage() {
  const params = useParams()
  const eventId = params.eventId as string
  
  // Fetch event details
  const { data: event, isLoading: isLoadingEvent } = useLegacyQuery(
    ['event', eventId],
    () => getEventById(eventId)
  )
  
  // Fetch event invitations
  const { data: invitations, isLoading: isLoadingInvitations } = useLegacyQuery(
    ['invitations', eventId],
    () => getInvitationsByEventId(eventId),
    { enabled: !!eventId }
  )
  
  // Selected invitation for QR display
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  
  // Set initial selected invitation when data loads
  useEffect(() => {
    if (invitations && invitations.length > 0 && !selectedInvitation) {
      setSelectedInvitation(invitations[0])
    }
  }, [invitations, selectedInvitation])
  
  // Generate event QR code URL
  const eventQrUrl = `${window.location.origin}/events/${eventId}/gallery`
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage QR codes for event access and guest authentication
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${eventId}/invitations/create`}>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Invitation
            </Button>
          </Link>
          <Link href={`/events/${eventId}/qr-scan`}>
            <Button size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              QR Scanner
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="gallery">
        <TabsList className="mb-6">
          <TabsTrigger value="gallery">Gallery QR</TabsTrigger>
          <TabsTrigger value="invitations">Invitation QRs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Gallery Access QR Code</CardTitle>
                <CardDescription>
                  Share this QR code for direct access to your event gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEvent ? (
                  <div className="flex justify-center">
                    <Skeleton className="h-[250px] w-[250px]" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      {event && (
                        <EventInvitationQR
                          invitation={{
                            id: 'gallery',
                            event_id: eventId,
                            email: '',
                            name: '',
                            status: 'active',
                            rsvp_status: 'pending',
                            token: `gallery/${eventId}`,
                            sent_at: null,
                            expires_at: null,
                            metadata: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          }}
                          eventName={event.name}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>QR Code Information</CardTitle>
                <CardDescription>How to use gallery QR codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Gallery Access</h3>
                  <p className="text-sm text-muted-foreground">
                    This QR code provides direct access to your event gallery. When scanned, visitors will be taken directly to the gallery page.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Display Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Print this QR code and display it at your event venue, or share it digitally with your guests.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    If your gallery is public, anyone with this QR code can access it. If it's private, guests will need to authenticate.
                  </p>
                </div>
                
                <div className="mt-6">
                  <Link href={`/events/${eventId}/settings`}>
                    <Button variant="outline" className="w-full">
                      Manage Gallery Settings
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invitations" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Invitations</CardTitle>
                  <CardDescription>
                    Select an invitation to view its QR code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingInvitations ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : invitations && invitations.length > 0 ? (
                    <div className="space-y-2">
                      {invitations.map((invitation) => (
                        <Button
                          key={invitation.id}
                          variant={selectedInvitation?.id === invitation.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedInvitation(invitation)}
                        >
                          <div className="truncate text-left">
                            <div className="font-medium truncate">
                              {invitation.name || invitation.email}
                            </div>
                            {invitation.name && (
                              <div className="text-xs text-muted-foreground truncate">
                                {invitation.email}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        No invitations found for this event
                      </p>
                      <Link href={`/events/${eventId}/invitations/create`}>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Invitation
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedInvitation ? (
                <EventInvitationQR 
                  invitation={selectedInvitation} 
                  eventName={event?.name || 'Event'}
                />
              ) : (
                <Card className="flex flex-col items-center justify-center h-full p-8">
                  <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    Select an invitation to view its QR code
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 