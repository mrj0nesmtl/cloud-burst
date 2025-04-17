'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { Camera, Upload, Image as ImageIcon, Users, AlertCircle, Filter, Search, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { invitationTokenService } from '@/lib/tokens/invitation-token'
import { formatDistanceToNow } from 'date-fns'
import { BottomNav } from '@/components/guest/bottom-nav'

type MediaItem = {
  id: string
  url: string
  uploaded_by: string
  created_at: string
  type: 'image' | 'video'
  is_camera_capture?: boolean
}

type Event = {
  id: string
  name: string
  description?: string
}

export default function GuestGalleryPage() {
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('token')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'mine' | 'camera' | 'images' | 'videos'>('all')
  
  // Initialize with token from URL or localStorage
  useEffect(() => {
    const token = urlToken || invitationTokenService.getToken()
    setInvitationToken(token)
    
    if (urlToken) {
      invitationTokenService.storeToken(urlToken)
    }
    
    if (!token) {
      setError('Invitation token not found')
      setLoading(false)
    } else {
      fetchEventAndMedia(token)
    }
  }, [urlToken])
  
  // Fetch event and media directly
  const fetchEventAndMedia = async (token: string) => {
    try {
      setLoading(true)
      
      // Get the invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, event_id')
        .eq('token', token)
        .single()
        
      if (invitationError || !invitation) {
        console.error('Error fetching invitation:', invitationError)
        setError('Invalid invitation token')
        setLoading(false)
        return
      }
      
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, description')
        .eq('id', invitation.event_id)
        .single()
      
      if (eventError) {
        console.error('Error fetching event:', eventError)
        setError('Failed to load event details')
        setLoading(false)
        return
      }
      
      setEvent(eventData)
      
      // Fetch media items directly for this event
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', invitation.event_id)
        .order('created_at', { ascending: false })
      
      if (mediaError) {
        console.error('Error fetching media:', mediaError)
        setError('Failed to load gallery media')
        setLoading(false)
        return
      }
      
      if (mediaData && mediaData.length > 0) {
        const processedMedia = mediaData.map(item => {
          // Determine media type based on url or type field
          const type = item.type || (item.url?.includes('.mp4') ? 'video' : 'image')
          
          return {
            id: item.id,
            url: item.url,
            uploaded_by: item.uploaded_by_token === token ? 'You' : 'Other Guest',
            created_at: item.created_at,
            type: type as 'image' | 'video',
            is_camera_capture: item.is_camera_capture || false
          }
        })
        
        setMediaItems(processedMedia)
        setFilteredMedia(processedMedia)
      } else {
        // No media found, but that's okay
        setMediaItems([])
        setFilteredMedia([])
      }
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading gallery:', err)
      setError(err.message || 'Failed to load gallery')
      setLoading(false)
    }
  }
  
  // Handle filtering and searching
  useEffect(() => {
    let result = [...mediaItems]
    
    // Apply filter
    if (filter === 'mine' && invitationToken) {
      result = result.filter(item => item.uploaded_by === 'You')
    } else if (filter === 'camera') {
      result = result.filter(item => item.is_camera_capture)
    } else if (filter === 'images') {
      result = result.filter(item => item.type === 'image')
    } else if (filter === 'videos') {
      result = result.filter(item => item.type === 'video')
    }
    
    // Apply search (if we had searchable metadata)
    if (searchQuery.trim()) {
      // This is a simple search - in a real app you'd search through metadata
      result = result.filter(item => 
        item.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredMedia(result)
  }, [filter, searchQuery, mediaItems, invitationToken])
  
  // Loading state
  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '32px 24px' }}>
        <Skeleton style={{ height: '48px', width: '75%', maxWidth: '500px', marginBottom: '40px', borderRadius: '8px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <Skeleton style={{ aspectRatio: '1', borderRadius: '12px' }} />
          <Skeleton style={{ aspectRatio: '1', borderRadius: '12px' }} />
          <Skeleton style={{ aspectRatio: '1', borderRadius: '12px' }} />
          <Skeleton style={{ aspectRatio: '1', borderRadius: '12px' }} />
          <Skeleton style={{ aspectRatio: '1', borderRadius: '12px' }} />
          <Skeleton style={{ aspectRatio: '1', borderRadius: '12px' }} />
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <Alert variant="destructive" style={{ marginBottom: '32px' }}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Button onClick={() => router.push('/guest/dashboard?token=' + invitationToken)}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  // Format the relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return 'Unknown time'
    }
  }
  
  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ 
        width: '100%',
        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 1))',
        padding: '32px 0 80px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            {event?.name || 'Event Gallery'}
          </h1>
          
          {event?.description && (
            <p style={{ 
              color: 'rgba(156, 163, 175, 1)', 
              marginBottom: '24px',
              maxWidth: '800px'
            }}>
              {event.description}
            </p>
          )}
          
          {/* Search and Filter */}
          <div style={{ 
            marginBottom: '32px',
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: 'rgba(156, 163, 175, 1)'
              }} />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', height: '44px' }}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', 
              paddingBottom: '8px' 
            }}>
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Media
              </Button>
              <Button 
                variant={filter === 'images' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('images')}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Images
              </Button>
              <Button 
                variant={filter === 'videos' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('videos')}
              >
                <Video className="mr-2 h-4 w-4" />
                Videos
              </Button>
              <Button 
                variant={filter === 'mine' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('mine')}
              >
                My Uploads
              </Button>
              <Button 
                variant={filter === 'camera' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('camera')}
              >
                Camera Captures
              </Button>
            </div>
          </div>
          
          {/* Media Gallery */}
          {filteredMedia.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '16px'
            }}>
              {filteredMedia.map((item) => (
                <Card key={item.id} style={{ 
                  overflow: 'hidden',
                  border: 'none',
                  background: 'rgba(30, 41, 59, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                  <CardContent style={{ padding: '0', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px', 
                      zIndex: '10',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {item.type === 'video' ? 'Video' : (item.is_camera_capture ? 'Camera' : 'Upload')}
                    </div>
                    
                    <div 
                      style={{
                        position: 'relative',
                        aspectRatio: '1/1',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}
                      onClick={() => router.push(`/guest/media/${item.id}?token=${invitationToken}`)}
                    >
                      {item.type === 'video' ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <Image
                            src={item.url.replace('.mp4', '.jpg') || '/images/video-placeholder.jpg'}
                            alt="Video thumbnail"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt="Event media"
                          fill
                          style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      )}
                    </div>
                    
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(30, 41, 59, 0.3)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: 'rgba(156, 163, 175, 1)'
                      }}>
                        <span>{item.uploaded_by}</span>
                        <span>{formatRelativeTime(item.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '48px 24px',
              border: '1px dashed rgba(156, 163, 175, 0.3)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)'
            }}>
              <ImageIcon style={{ 
                width: '48px', 
                height: '48px', 
                color: 'rgba(156, 163, 175, 0.6)',
                margin: '0 auto 16px'
              }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'white', marginBottom: '8px' }}>
                No media yet
              </h3>
              <p style={{ 
                color: 'rgba(156, 163, 175, 1)', 
                maxWidth: '400px',
                margin: '0 auto 24px'
              }}>
                {filter !== 'all' 
                  ? 'Try changing your filter settings' 
                  : `Be the first to share photos and videos for ${event?.name || 'this event'}!`}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Button 
                  style={{ paddingLeft: '16px', paddingRight: '16px', height: '44px' }}
                  onClick={() => router.push(`/guest/camera?token=${invitationToken}`)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take a Photo
                </Button>
                <Button 
                  variant="outline"
                  style={{ paddingLeft: '16px', paddingRight: '16px', height: '44px' }}
                  onClick={() => router.push(`/guest/upload?token=${invitationToken}`)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav activeTab="gallery" invitationToken={invitationToken} />
    </div>
  )
} 