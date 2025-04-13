'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, CameraIcon, ImageIcon, UserCircle2Icon, CalendarIcon, MapPinIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatDate } from '@/lib/utils'
import { invitationTokenService } from '@/lib/tokens/invitation-token'

export default function GuestDashboardPage() {
  const searchParams = useSearchParams()
  
  // Use token service to get token from multiple sources
  const invitationToken = invitationTokenService.getToken(searchParams)
  const eventId = searchParams.get('event')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [guest, setGuest] = useState<any>(null)

  useEffect(() => {
    async function loadEventData() {
      setLoading(true)
      setError(null)

      const supabase = createClientComponentClient()
      
      try {
        // First check if we have a token
        if (!invitationToken && !eventId) {
          throw new Error('No invitation token or event ID provided')
        }

        let invitation
        let eventData
        
        // If we have a token, get the invitation first
        if (invitationToken) {
          // Fetch invitation
          const { data: invData, error: invError } = await supabase
            .from('invitations')
            .select('id, email, name, event_id, status')
            .eq('token', invitationToken)
            .single()
            
          if (invError || !invData) {
            console.error('Error fetching invitation:', invError)
            throw new Error('Invalid invitation token')
          }
          
          invitation = invData
          
          // Get event using invitation's event_id
          const { data: evtData, error: evtError } = await supabase
            .from('events')
            .select('*')
            .eq('id', invitation.event_id)
            .single()
            
          if (evtError || !evtData) {
            console.error('Error fetching event:', evtError)
            throw new Error('Event not found')
          }
          
          eventData = evtData
        }
        // If no token but we have an event ID
        else if (eventId) {
          // Get event directly
          const { data: evtData, error: evtError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single()
            
          if (evtError || !evtData) {
            console.error('Error fetching event by ID:', evtError)
            throw new Error('Event not found')
          }
          
          eventData = evtData
          
          // Try to find invitation for this event
          const { data: invData, error: invError } = await supabase
            .from('invitations')
            .select('id, email, name, token')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
            
          if (!invError && invData) {
            invitation = invData
            
            // Store the token for future use
            if (invitation.token) {
              invitationTokenService.storeToken(invitation.token)
            }
          }
        }
        
        if (!eventData) {
          throw new Error('Could not find event information')
        }
        
        setEvent(eventData)
        
        // Now get guest information if we have an invitation
        if (invitation) {
          // Check for guest profile using invitation ID
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .select('*')
            .eq('invitation_id', invitation.id)
            .maybeSingle()
            
          if (!guestError && guestData) {
            setGuest(guestData)
          } else {
            // If no guest profile, check for RSVP
            const { data: rsvpData, error: rsvpError } = await supabase
              .from('rsvps')
              .select('*')
              .eq('invitation_id', invitation.id)
              .maybeSingle()
              
            if (!rsvpError && rsvpData) {
              setGuest({
                name: rsvpData.guest_name || invitation.name,
                email: rsvpData.guest_email || invitation.email,
                rsvp_status: rsvpData.status === 'accepted' ? 'attending' : rsvpData.status,
                phone: rsvpData.guest_phone,
                invitation_id: invitation.id
              })
            } else {
              // No guest profile or RSVP, use invitation data
              setGuest({
                name: invitation.name,
                email: invitation.email,
                invitation_id: invitation.id
              })
            }
          }
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('Error loading dashboard data:', err)
        setError(err.message || 'Failed to load event data')
        setLoading(false)
      }
    }

    loadEventData()
  }, [invitationToken, eventId])

  if (loading) {
    return (
      <div className="container max-w-7xl py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading event information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-muted-foreground text-center mt-4">
          Please check your invitation link or contact the event organizer.
        </p>
        <div className="flex justify-center mt-8">
          <Button asChild variant="default">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const hasProfileCompleted = guest?.name && guest?.email
  const eventDate = event?.date ? new Date(event.date) : null
  const canUploadPhotos = event?.allow_photo_sharing && (
    !event.photo_upload_deadline || new Date() <= new Date(event.photo_upload_deadline)
  )
  
  // Prepare params for links
  const getLinkParams = () => {
    const params = new URLSearchParams()
    if (invitationToken) {
      params.set('token', invitationToken)
    } else if (eventId) {
      params.set('event', eventId)
    }
    return params.toString()
  }
  
  const linkParams = getLinkParams()
  
  return (
    <div className="container max-w-7xl py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{event.name || 'Event Dashboard'}</h1>
        <p className="text-muted-foreground mt-1">Welcome to your personal event dashboard</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Information about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.date && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formatDate(event.date)}</p>
                  {event.time && <p className="text-sm text-muted-foreground">{event.time}</p>}
                </div>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  {event.location_details && (
                    <p className="text-sm text-muted-foreground">{event.location_details}</p>
                  )}
                </div>
              </div>
            )}
            
            {event.description && (
              <div className="pt-2">
                <p className="text-sm whitespace-pre-line">{event.description}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-2">
              {event.status && (
                <Badge variant={event.status === 'active' ? 'default' : 'outline'}>
                  {event.status === 'active' ? 'Active' : event.status}
                </Badge>
              )}
              {event.type && <Badge variant="outline">{event.type}</Badge>}
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Things you can do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {canUploadPhotos && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href={`/guest/photos?${linkParams}`} className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Upload Photos</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}

                {(event?.use_camera_feature && canUploadPhotos) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href={`/guest/camera-setup?${linkParams}`} className="flex items-center gap-2">
                        <CameraIcon className="h-4 w-4" />
                        <span>Test Camera</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}

                {!hasProfileCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href={`/guest/profile?${linkParams}`} className="flex items-center gap-2">
                        <UserCircle2Icon className="h-4 w-4" />
                        <span>Complete Your Profile</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!canUploadPhotos && event?.allow_photo_sharing && (
                <Alert>
                  <AlertTitle>Photo Upload Closed</AlertTitle>
                  <AlertDescription>
                    The deadline for uploading photos has passed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {guest && (
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{guest.name || 'Not provided'}</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{guest.email || 'Not provided'}</span>
                  </p>
                  {guest.rsvp_status && (
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">RSVP:</span>
                      <Badge variant={guest.rsvp_status === 'attending' ? 'default' : 'outline'}>
                        {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                      </Badge>
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={`/guest/profile?${linkParams}`}>
                    {hasProfileCompleted ? 'Update Profile' : 'Complete Profile'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 