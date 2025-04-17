'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Camera, Upload, Image as ImageIcon, Users, Info, PartyPopper, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { invitationTokenService } from '@/lib/tokens/invitation-token'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { BottomNav } from '@/components/guest/bottom-nav'

export default function GuestDashboardPage() {
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('token')
  const fromParam = searchParams.get('from')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [guest, setGuest] = useState<any>(null)
  const [recentPhotos, setRecentPhotos] = useState<any[]>([])
  const [photoCount, setPhotoCount] = useState(0)

  // Get invitation token - from URL parameter or from local storage
  const invitationToken = urlToken || invitationTokenService.getToken()
  
  // Store token received in URL to localStorage for future use
  useEffect(() => {
    if (urlToken) {
      invitationTokenService.storeToken(urlToken)
    }
    
    // Show welcome toast if coming from profile
    if (fromParam === 'profile') {
      toast({
        title: "🎉 Welcome to your Event Dashboard!",
        description: "Your profile has been set up successfully. Start sharing photos!",
        variant: "default",
      })
    }
  }, [urlToken, fromParam, toast])

  useEffect(() => {
    async function loadEventAndGuestData() {
      try {
        setLoading(true)
        
        if (!invitationToken) {
          setError('Invitation token not found')
          setLoading(false)
          return
        }
        
        // Get the invitation details
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, event_id')
          .eq('token', invitationToken)
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
          .select('*')
          .eq('id', invitation.event_id)
          .single()
          
        if (eventError || !eventData) {
          console.error('Error fetching event:', eventError)
          setError('Event not found')
          setLoading(false)
          return
        }
        
        setEvent(eventData)
        
        // Get guest details
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('invitation_id', invitation.id)
          .single()
          
        if (guestError) {
          console.error('Error fetching guest:', guestError)
          setError('Guest profile not found')
          setLoading(false)
          return
        }
        
        setGuest(guestData)
        
        // Get recent photos
        try {
          const { data: photosData, error: photosError } = await supabase
            .from('photos')
            .select('id, url, created_at')
            .eq('event_id', invitation.event_id)
            .order('created_at', { ascending: false })
            .limit(6)
            
          if (!photosError && photosData) {
            setRecentPhotos(photosData)
          }
          
          // Get photo count
          const { count, error: countError } = await supabase
            .from('photos')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', invitation.event_id)
            
          if (!countError) {
            setPhotoCount(count || 0)
          }
        } catch (photoError) {
          console.error('Error fetching photos:', photoError)
          // We continue even if photos fail to load
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('Dashboard load error:', err)
        setError(err.message || 'Failed to load dashboard')
        setLoading(false)
      }
    }
    
    loadEventAndGuestData()
  }, [supabase, invitationToken])

  // Function to format a date for the countdown
  const formatCountdown = (date: string | Date) => {
    const eventDate = new Date(date)
    const now = new Date()
    const diff = eventDate.getTime() - now.getTime()
    
    // If the event is in the past
    if (diff < 0) {
      return { isUpcoming: false, text: 'Event has ended' }
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return {
      isUpcoming: true,
      text: days > 0 ? `${days} days, ${hours} hours` : `${hours} hours`,
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', padding: '32px 24px' }}>
        <Skeleton style={{ height: '48px', width: '75%', maxWidth: '500px', marginBottom: '40px', borderRadius: '8px' }} />
        <Skeleton style={{ height: '240px', width: '100%', marginBottom: '32px', borderRadius: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <Skeleton style={{ height: '160px', borderRadius: '12px' }} />
          <Skeleton style={{ height: '160px', borderRadius: '12px' }} />
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div style={{ width: '100%', maxWidth: '800px', padding: '40px 24px' }}>
        <Alert variant="destructive" style={{ marginBottom: '32px' }}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <Button variant="outline" onClick={() => router.push('/guest/profile?token=' + invitationToken)}>
            Set Up Your Profile
          </Button>
        </div>
      </div>
    )
  }

  // Calculate countdown if event has a date
  const countdown = event?.date ? formatCountdown(event.date) : null
  
  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {/* Hero Banner with Event Details */}
      <div 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.7))', 
          color: 'white',
          padding: '0',
          width: '100%',
          position: 'relative'
        }}
      >
        <div 
          style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            padding: '60px 32px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10
          }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>
            {event?.name || 'Event Dashboard'}
          </h1>
          
          <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '24px' }}>
            {formatDate(event?.date) || 'Date not available'}
          </p>
          
          {/* Countdown or status */}
          {countdown && (
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px', 
                background: 'rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(8px)',
                padding: '10px 20px',
                borderRadius: '9999px',
                marginBottom: '32px'
              }}
            >
              {countdown.isUpcoming ? (
                <>
                  <Clock style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    Countdown: {countdown.text}
                  </span>
                </>
              ) : (
                <>
                  <PartyPopper style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {countdown.text}
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Welcome message */}
          <div style={{ marginBottom: '36px', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '12px' }}>
              Welcome, {guest?.name || 'Guest'}!
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.9 }}>
              {event?.description || 'Share and collect memories from this special event.'}
            </p>
          </div>
          
          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
            <Button 
              className="bg-white hover:bg-white/90 text-primary"
              size="lg"
              style={{ 
                fontWeight: '500', 
                padding: '10px 20px', 
                height: 'auto',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
              }}
              onClick={() => router.push(`/guest/camera?token=${invitationToken}`)}
            >
              <Camera className="mr-2 h-5 w-5" />
              Take Photos
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              style={{ 
                fontWeight: '500', 
                padding: '10px 20px', 
                height: 'auto',
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
              onClick={() => router.push(`/guest/gallery?token=${invitationToken}`)}
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              View Gallery
            </Button>
          </div>
        </div>
      </div>
    
      {/* Feature Cards */}
      <div style={{ 
        width: '100%',
        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 1))',
        padding: '48px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Photo Collection Card */}
          <Card style={{ 
            overflow: 'hidden', 
            border: 'none', 
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1), rgba(79, 70, 229, 0.1))',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '9999px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ImageIcon style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>Photo Collection</h3>
                  <p style={{ color: 'rgba(156, 163, 175, 1)' }}>{photoCount} photos shared so far</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                style={{ padding: '8px 0', color: '#3b82f6', background: 'transparent' }}
                onClick={() => router.push(`/guest/upload?token=${invitationToken}`)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload from your device
              </Button>
            </CardContent>
          </Card>

          {/* Event Details Card */}
          <Card style={{ 
            overflow: 'hidden', 
            border: 'none', 
            background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.1), rgba(234, 88, 12, 0.1))',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '9999px',
                  background: 'rgba(234, 88, 12, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Info style={{ width: '28px', height: '28px', color: '#f97316' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>Event Details</h3>
                  <p style={{ color: 'rgba(156, 163, 175, 1)' }}>Location: {event?.location || 'Not specified'}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                style={{ padding: '8px 0', color: '#f97316', background: 'transparent' }}
                onClick={() => router.push(`/guest/event-details?token=${invitationToken}`)}
              >
                <Users className="mr-2 h-4 w-4" />
                View event details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Recent Photos Gallery */}
      <div style={{ 
        width: '100%',
        padding: '48px 0 80px',
        background: 'rgba(15, 23, 42, 1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white' }}>Recent Photos</h2>
            <Button 
              variant="ghost" 
              style={{ color: 'rgba(156, 163, 175, 1)' }}
              onClick={() => router.push(`/guest/gallery?token=${invitationToken}`)}
            >
              View All
            </Button>
          </div>
          
          {recentPhotos.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '20px'
            }}>
              {recentPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  style={{ 
                    position: 'relative',
                    aspectRatio: '1/1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                  }}
                  onClick={() => router.push(`/guest/photo/${photo.id}?token=${invitationToken}`)}
                >
                  <Image
                    src={photo.url}
                    alt="Event photo"
                    fill
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div style={{ 
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0)',
                    transition: 'background 0.3s ease'
                  }}></div>
                </div>
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
                No photos yet
              </h3>
              <p style={{ 
                color: 'rgba(156, 163, 175, 1)', 
                maxWidth: '400px',
                margin: '0 auto 24px',
                lineHeight: '1.6'
              }}>
                Be the first to share memories from this event!
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
      <BottomNav activeTab="dashboard" invitationToken={invitationToken} />
    </div>
  )
}