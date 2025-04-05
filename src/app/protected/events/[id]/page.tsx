import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
import { RsvpTabTrigger } from '@/components/events/rsvp-tab-trigger'
import { Photo } from '@/types/events'
import { Invitation } from '@/types/invitations'
import { Button } from '@/components/ui/button'
import { EventInvitationsPanel } from '@/components/events/event-invitations-panel'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RsvpDashboard } from '@/components/events/rsvp-dashboard'
import { Mail } from 'lucide-react'

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
  const { data: dbPhotos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })
  
  // Convert database photos to Photo type with proper url property
  const photos = dbPhotos?.map(photo => convertDatabasePhotoToPhotoType(photo, params.id)) || []
  
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
      boxSizing: 'border-box',
      marginBottom: '4rem'
    }}>
      {/* Redesigned event header section */}
      <Card style={{ 
        marginBottom: '0.75rem', 
        width: '100%',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow, 0 2px 8px rgba(0,0,0,0.08))',
        borderRadius: '0.75rem',
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
              <LucideIcons.Calendar style={{ height: '0.8rem', width: '0.8rem', flexShrink: 0 }} />
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
                <LucideIcons.MapPin style={{ height: '0.8rem', width: '0.8rem', flexShrink: 0 }} />
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
      
      <Tabs defaultValue="overview" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <TabsList style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          marginBottom: '0.75rem',
          maxWidth: '100%',
          overflowX: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
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
                  <LucideIcons.FileText 
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
                  <LucideIcons.Mail 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {invitations && invitations.length > 0 && (
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
                      {invitations.length}
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
                  <LucideIcons.Users 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {attendees && attendees.length > 0 && (
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
                      {attendees.length}
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
                  <LucideIcons.Image 
                    size={18} 
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      transition: 'color 0.2s ease'
                    }} 
                    className="text-foreground group-hover:text-primary"
                  />
                  {photos && photos.length > 0 && (
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
                      {photos.length}
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
            
            <RsvpTabTrigger eventId={params.id} />
            
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
                  <LucideIcons.QrCode 
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
          <Card style={{ 
            width: '100%',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow, 0 2px 8px rgba(0,0,0,0.08))',
          }}>
            <CardHeader style={{ 
              padding: '1rem', 
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--card-header-bg, rgba(0,0,0,0.02))'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <LucideIcons.Info size={16} className="text-primary" />
                <CardTitle style={{ fontSize: '1rem', margin: 0 }}>Event Details</CardTitle>
              </div>
              <CardDescription style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Complete information about this event
              </CardDescription>
            </CardHeader>
            
            <CardContent style={{ 
              padding: '0',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '8px',
                backgroundColor: 'var(--background)',
                width: '100%',
                padding: '8px'
              }}>
                {/* Event Logo/Thumbnail Section */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <LucideIcons.Image size={14} className="text-primary" />
                    Event Logo
                  </h3>
                  
                  <div style={{
                    width: '100%',
                    height: '160px',
                    backgroundColor: 'var(--muted)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid var(--border)'
                  }}>
                    {event.logo_url ? (
                      <img 
                        src={event.logo_url} 
                        alt={`${event.name} logo`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <LucideIcons.Camera size={32} style={{ color: 'var(--muted-foreground)', opacity: 0.7 }} />
                    )}
                  </div>
                </div>
                
                {/* Basic Info */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <LucideIcons.FileText size={14} className="text-primary" />
                    Basic Information
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {/* Name */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Event Name
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {event.name}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Description
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'normal',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto',
                        maxHeight: '120px',
                        borderRadius: '0.25rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--secondary-foreground-5, rgba(0,0,0,0.02))'
                      }}>
                        {event.description || 'No description provided'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Time & Location */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <LucideIcons.CalendarClock size={14} className="text-primary" />
                    When & Where
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {/* Date */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Date
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem' 
                      }}>
                        <LucideIcons.Calendar size={14} className="text-muted-foreground" />
                        {eventDate}
                      </div>
                    </div>
                    
                    {/* Time */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Time
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem' 
                      }}>
                        <LucideIcons.Clock size={14} className="text-muted-foreground" />
                        {(event as any).time_string || (event as any).start_time || 'No specific time set'}
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Location
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem' 
                      }}>
                        <LucideIcons.MapPin size={14} className="text-muted-foreground" style={{ marginTop: '0.2rem' }} />
                        <span style={{ lineHeight: 1.5 }}>{event.location || 'No location set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Capacity & Settings */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <LucideIcons.Settings size={14} className="text-primary" />
                    Capacity & Settings
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {/* Max Attendees */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Maximum Attendees
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem' 
                      }}>
                        <LucideIcons.Users size={14} className="text-muted-foreground" />
                        {event.max_attendees ? `${event.max_attendees} people` : 'Unlimited'}
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Status
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem' 
                      }}>
                        <Badge variant={
                          event.status === 'published' ? 'default' :
                          event.status === 'draft' ? 'secondary' :
                          event.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }>
                          {(event.status || 'draft').charAt(0).toUpperCase() + (event.status || 'draft').slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Visibility */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Visibility
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem' 
                      }}>
                        {event.is_public ? (
                          <>
                            <LucideIcons.Globe size={14} className="text-muted-foreground" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <LucideIcons.Lock size={14} className="text-muted-foreground" />
                            <span>Private (Invitation Only)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Branding & Customization */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <LucideIcons.Palette size={14} className="text-primary" />
                    Branding & Customization
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {/* Custom URL */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                        Custom URL
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem' 
                      }}>
                        <LucideIcons.Link size={14} className="text-muted-foreground" />
                        {event.custom_url || 'No custom URL set'}
                      </div>
                    </div>
                    
                    {/* Gallery Color */}
                    {event.accent_color && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: 'var(--muted-foreground)' }}>
                          Gallery Color
                        </div>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '50%',
                            backgroundColor: event.accent_color,
                            border: '1px solid var(--border)'
                          }}></div>
                          <span style={{ fontSize: '0.75rem' }}>{event.accent_color}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Stats & Activity */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <LucideIcons.BarChart size={14} className="text-primary" />
                    Stats & Activity
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {/* Attendees */}
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                        Attendees
                      </div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}>
                        <LucideIcons.Users size={14} className="text-muted-foreground" />
                        {attendees?.length || 0}
                      </div>
                    </div>
                    
                    {/* Invitations */}
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                        Invitations
                      </div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}>
                        <LucideIcons.Mail size={14} className="text-muted-foreground" />
                        {invitations?.length || 0}
                      </div>
                    </div>
                    
                    {/* Photos */}
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                        Photos
                      </div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}>
                        <LucideIcons.Image size={14} className="text-muted-foreground" />
                        {photos?.length || 0}
                      </div>
                    </div>
                    
                    {/* Created Date */}
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                        Created
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}>
                        {event.created_at ? format(new Date(event.created_at), 'MMM d, yyyy') : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Social Media Links */}
                {(event.website_url || event.facebook_url || event.instagram_url || event.twitter_url) && (
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    gridColumn: '1 / -1',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <h3 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: 'var(--primary)',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <LucideIcons.Share2 size={14} className="text-primary" />
                      Social Media & Links
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      {event.website_url && (
                        <a 
                          href={event.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: 'var(--foreground)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          <LucideIcons.Globe size={16} className="text-primary" />
                          Website
                        </a>
                      )}
                      
                      {event.facebook_url && (
                        <a 
                          href={event.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: 'var(--foreground)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          <LucideIcons.Facebook size={16} className="text-primary" />
                          Facebook
                        </a>
                      )}
                      
                      {event.instagram_url && (
                        <a 
                          href={event.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: 'var(--foreground)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          <LucideIcons.Instagram size={16} className="text-primary" />
                          Instagram
                        </a>
                      )}
                      
                      {event.twitter_url && (
                        <a 
                          href={event.twitter_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: 'var(--foreground)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          <LucideIcons.Twitter size={16} className="text-primary" />
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                  <LucideIcons.Mail style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} /> 
                  Send Invitations
                </Button>
              </Link>
            </CardHeader>
            <CardContent style={{ padding: '0.5rem' }}>
              <EventInvitationsPanel eventId={params.id} />
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
                <LucideIcons.UserPlus style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
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

        <TabsContent value="gallery" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gallery</CardTitle>
                <CardDescription>
                  Upload and manage event photos
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <LucideIcons.Upload className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/protected/events/${params.id}/gallery`}>
                    <LucideIcons.Eye className="mr-2 h-4 w-4" />
                    View Gallery
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {photos && photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.slice(0, 8).map((photo, index) => (
                    <div key={index} className="aspect-square relative overflow-hidden rounded-md border">
                      <div className="relative w-full h-full">
                        <img
                          src={photo.url || photo.storage_path || ''}
                          alt={`Event photo ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  ))}
                  {photos.length > 8 && (
                    <Link
                      href={`/protected/events/${params.id}/gallery`}
                      className="aspect-square flex items-center justify-center rounded-md border bg-muted/50 hover:bg-muted"
                    >
                      <div className="text-center">
                        <LucideIcons.Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          View {photos.length - 8} more
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LucideIcons.Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No photos uploaded yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Upload photos of your event to create a gallery that attendees can view and interact with.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <Link href={`/protected/events/${params.id}/gallery`}>
                        Browse Gallery
                      </Link>
                    </Button>
                    <Button>
                      <LucideIcons.Upload className="mr-2 h-4 w-4" />
                      Upload Photos
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsvps">
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
              <div>
                <CardTitle style={{ fontSize: '0.875rem' }}>RSVP Management</CardTitle>
                <CardDescription style={{ fontSize: '0.75rem' }}>
                  Track and manage RSVPs for {event.name}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0.5rem' }}>
              <RsvpDashboard eventId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode" className="mt-2 space-y-4">
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
              <QRCodeDisplay 
                eventId={params.id}
                eventName={event.name}
                type="event"
                description="Scan this code to access the event"
                size={240}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
