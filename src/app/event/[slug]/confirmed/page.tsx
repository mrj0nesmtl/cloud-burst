import { Metadata } from 'next'
import Link from 'next/link'
import { Check, Calendar, Share, Camera, User } from 'lucide-react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'RSVP Confirmed',
  description: 'Thank you for confirming your attendance',
}

// Function to get the most recent invitation token for an event
async function getInvitationToken(eventId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get the invitation directly using the event ID
    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations')
      .select('id, token, event_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    if (invitationError || !invitationData) {
      console.error('Error fetching invitation data:', invitationError)
      return null
    }

    // Check if there's an RSVP for this invitation
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('invitation_id', invitationData.id)
      .eq('status', 'yes')
      .maybeSingle()
      
    if (rsvpError) {
      console.error('Error fetching RSVP data:', rsvpError)
      // Not blocking, we'll use the invitation token regardless
    }
    
    return invitationData.token
  } catch (error) {
    console.error('Error in getInvitationToken:', error)
    return null
  }
}

export default async function ConfirmedPage({ params }: { params: { slug: string } }) {
  // Get the invitation token for this event
  const invitationToken = await getInvitationToken(params.slug)
  
  // Prepare query params for the profile and camera setup pages
  const profileQueryParams = new URLSearchParams()
  if (invitationToken) {
    profileQueryParams.set('token', invitationToken)
  } else {
    profileQueryParams.set('event', params.slug)
  }
  
  const profileUrl = `/guest/profile?${profileQueryParams}`
  const cameraUrl = `/guest/camera-setup?${profileQueryParams}`
  
  return (
    <div className="container max-w-lg py-10">
      <div className="space-y-6 text-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            Your RSVP has been confirmed!
          </h1>
          <p className="text-gray-300">
            Thank you for confirming your attendance
          </p>
        
          <div className="space-y-2">
            <p>
              We're excited to see you at the event. We've sent a confirmation email with all the details.
            </p>
            <p className="text-sm text-gray-400">
              If you need to make changes to your RSVP, please contact the event host.
            </p>
          </div>
        </div>
        
        <Separator className="border-gray-800" />
        
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Complete Your Setup</h3>
          <p className="text-sm text-gray-300">
            To make the most of your event experience, please complete these quick steps:
          </p>
          
          <div className="space-y-3">
            <Link 
              href={profileUrl}
              className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-md w-full"
            >
              <User className="mr-2 h-5 w-5" />
              Complete Your Profile
            </Link>
            
            <Link 
              href={cameraUrl}
              className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-md w-full"
            >
              <Camera className="mr-2 h-5 w-5" />
              Set Up Camera Access
            </Link>
          </div>
        </div>
        
        <Separator className="border-gray-800" />
        
        <div className="space-y-4">
          <Link 
            href={`/event/${params.slug}`}
            className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-md w-full"
          >
            <Calendar className="mr-2 h-5 w-5" />
            View Event Details
          </Link>
          
          <Link 
            href={`/event/${params.slug}/share`}
            className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-md w-full"
          >
            <Share className="mr-2 h-5 w-5" />
            Share With Friends
          </Link>
        </div>
      </div>
    </div>
  )
} 