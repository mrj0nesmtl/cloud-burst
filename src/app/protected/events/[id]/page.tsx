import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Mail, UserPlus, Upload, Eye, Printer, Download, Info, Users, QrCode, Image, FileText, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

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
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    <div style={{ 
      padding: '0.5rem', 
      width: '100%', 
      maxWidth: '100%', 
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Redesigned event header section */}
      <Card style={{ 
        marginBottom: '0.75rem', 
        width: '100%',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}>
        <CardContent style={{ 
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Title and status row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.5rem',
            width: '100%'
          }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              lineHeight: '1.2',
              margin: 0,
              paddingTop: '0.25rem',
              wordBreak: 'break-word'
            }}>
              {event.name}
            </h1>
            <EventStatusSelector eventId={event.id} currentStatus={event.status || 'draft'} />
          </div>
          
          {/* Date and location with icons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            width: '100%'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              color: 'var(--muted-foreground)'
            }}>
              <Calendar style={{ height: '0.8rem', width: '0.8rem', flexShrink: 0 }} />
              <p style={{ 
                fontSize: '0.75rem', 
                margin: 0,
                lineHeight: 1.2
              }}>
                {eventDate}
              </p>
            </div>

            {event.location && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                color: 'var(--muted-foreground)'
              }}>
                <MapPin style={{ height: '0.8rem', width: '0.8rem', flexShrink: 0 }} />
                <p style={{ 
                  fontSize: '0.75rem', 
                  margin: 0,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {event.location}
                </p>
              </div>
            )}
          </div>
          
          {/* Action buttons in a more symmetrical layout */}
          <div style={{ 
            width: '100%',
            marginTop: '0.25rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <EventActions eventId={event.id} organizerId={event.organizer_id || undefined} />
          </div>
        </CardContent>
      </Card>
      
      {event.description && (
        <Card style={{ marginBottom: '0.75rem', width: '100%' }}>
          <CardHeader style={{ padding: '0.5rem' }}>
            <CardTitle style={{ fontSize: '0.875rem' }}>About this event</CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '0 0.5rem 0.5rem' }}>
            <p style={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>{event.description}</p>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="overview" style={{ width: '100%' }}>
        <TabsList style={{ 
          width: '100%', 
          overflowX: 'auto', 
          display: 'flex', 
          whiteSpace: 'nowrap',
          padding: '0.5rem',
          marginBottom: '0.5rem',
          fontSize: '0.75rem',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          justifyContent: 'space-around',
          gap: '0.5rem',
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)'
        }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="overview" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <FileText 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Overview</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="invitations" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <Mail 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {invitations?.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {invitations?.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Invitations {invitations?.length ? `(${invitations?.length})` : ''}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="attendees" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <Users 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {attendees?.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {attendees?.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Attendees ({attendees?.length || 0})</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="gallery" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <Image 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {photos?.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1rem',
                      height: '1rem',
                      fontSize: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      {photos?.length}
                    </span>
                  )}
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Gallery ({photos?.length || 0})</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="qrcode" style={{ 
                  padding: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'var(--card)'
                }} className="group">
                  <QrCode 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  <span 
                    className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ borderRadius: '50%' }}
                  ></span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>QR Code</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>
        
        <TabsContent value="overview" style={{ width: '100%' }}>
          <Card style={{ width: '100%' }}>
            <CardHeader style={{ padding: '0.5rem' }}>
              <CardTitle style={{ fontSize: '0.875rem' }}>Event Details</CardTitle>
              <CardDescription style={{ fontSize: '0.75rem' }}>
                Complete information about this event
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '0 0.5rem 0.5rem' }}>
              {/* Mobile-friendly grid layout optimized for narrow screens */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '0.5rem',
                width: '100%' 
              }}>
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--muted)', 
                  opacity: '0.5', 
                  borderRadius: '0.375rem'
                }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Date & Time</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {eventDate}
                  </p>
                </div>
                
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--muted)', 
                  opacity: '0.5', 
                  borderRadius: '0.375rem'
                }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Location</h3>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--muted-foreground)', 
                    marginTop: '0.25rem',
                    wordBreak: 'break-word' 
                  }}>
                    {event.location || 'No location set'}
                  </p>
                </div>
                
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--muted)', 
                  opacity: '0.5', 
                  borderRadius: '0.375rem'
                }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Capacity</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {event.max_attendees ? `${event.max_attendees} maximum attendees` : 'Unlimited'}
                  </p>
                </div>
                
                <div style={{ 
                  padding: '0.5rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.375rem'
                }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Attendees</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {attendees?.length || 0} registered
                  </p>
                </div>
                
                <div style={{ 
                  padding: '0.5rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.375rem'
                }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Photos</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {photos?.length || 0} uploaded
                  </p>
                </div>
                
                <div style={{ 
                  padding: '0.5rem', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.375rem'
                }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Custom URL</h3>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--muted-foreground)', 
                    marginTop: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word'
                  }}>
                    {event.custom_url || 'Not set'}
                  </p>
                </div>
              </div>
              
              {/* Only show additional information if description exists */}
              {event.description && event.description.length > 100 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <h3 style={{ fontWeight: '500', fontSize: '0.75rem' }}>Additional Information</h3>
                  <p style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--muted-foreground)', 
                    marginTop: '0.25rem',
                    wordBreak: 'break-word' 
                  }}>
                    {event.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card style={{ width: '100%' }}>
            <CardHeader style={{ 
              padding: '0.5rem', 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.35rem'
            }}>
              <CardTitle style={{ fontSize: '0.875rem' }}>Invitations</CardTitle>
              <Link href={`/protected/attendees/invitations?eventId=${event.id}`}>
                <Button variant="outline" size="sm" style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
                  <Mail style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} /> 
                  Send Invitations
                </Button>
              </Link>
            </CardHeader>
            <CardContent style={{ padding: '0.5rem' }}>
              {invitations && invitations.length > 0 ? (
                <div style={{ width: '100%' }}>
                  {/* Invitation list would go here */}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  color: 'var(--muted-foreground)',
                  fontSize: '0.75rem'
                }}>
                  No invitations have been sent for this event.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees">
          <Card style={{ width: '100%' }}>
            <CardHeader style={{ 
              padding: '0.5rem', 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.35rem'
            }}>
              <CardTitle style={{ fontSize: '0.875rem' }}>Attendees</CardTitle>
              <Button variant="outline" size="sm" style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
                <UserPlus style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
                Add Attendee
              </Button>
            </CardHeader>
            <CardContent style={{ padding: '0.5rem' }}>
              {attendees && attendees.length > 0 ? (
                <div style={{ width: '100%' }}>
                  {/* Attendee list would go here */}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  color: 'var(--muted-foreground)',
                  fontSize: '0.75rem'
                }}>
                  No attendees have registered for this event yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card style={{ width: '100%' }}>
            <CardHeader style={{ 
              padding: '0.5rem', 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.35rem'
            }}>
              <CardTitle style={{ fontSize: '0.875rem' }}>Gallery</CardTitle>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <Button variant="outline" size="sm" asChild style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
                  <Link href={`/events/${event.id}/upload`}>
                    <Upload style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
                    Upload
                  </Link>
                </Button>
                
                <Button size="sm" asChild style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
                  <Link href={`/events/${event.id}/gallery`}>
                    <Eye style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
                    View
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0.5rem' }}>
              {photos && photos.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
                  gap: '0.35rem',
                  width: '100%'
                }}>
                  {/* Photo thumbnails would go here */}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '0.75rem', 
                  color: 'var(--muted-foreground)',
                  fontSize: '0.75rem'
                }}>
                  No photos have been uploaded for this event yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card style={{ width: '100%' }}>
            <CardHeader style={{ padding: '0.5rem' }}>
              <CardTitle style={{ fontSize: '0.875rem' }}>QR Code</CardTitle>
              <CardDescription style={{ fontSize: '0.75rem' }}>
                Share this QR code for easy event access
              </CardDescription>
            </CardHeader>
            <CardContent style={{ 
              padding: '0.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '0.5rem', 
                borderRadius: '0.375rem', 
                marginBottom: '0.5rem'
              }}>
                {/* QR code would go here */}
                <div style={{ 
                  width: '9rem', 
                  height: '9rem', 
                  backgroundColor: '#f1f5f9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#64748b'
                }}>
                  QR Code
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <Button variant="outline" size="sm" style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
                  <Printer style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
                  Print
                </Button>
                <Button variant="outline" size="sm" style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
                  <Download style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
