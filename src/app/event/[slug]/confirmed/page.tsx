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

// Function to create or update RSVP record
async function createOrUpdateRsvp(eventId: string, token: string) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // First get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, email, name, status')
      .eq('token', token)
      .single()
      
    if (invitationError || !invitation) {
      console.error('Invalid invitation token or invitation not found:', invitationError)
      return { 
        success: false, 
        error: 'Invalid invitation token or invitation not found' 
      }
    }
    
    console.log('Found invitation:', invitation)
    
    // Check if there's already an RSVP for this invitation
    const { data: existingRsvp, error: rsvpCheckError } = await supabase
      .from('rsvps')
      .select('id, status')
      .eq('invitation_id', invitation.id)
      .maybeSingle()
      
    if (rsvpCheckError && rsvpCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing RSVP:', rsvpCheckError)
      return { 
        success: false, 
        error: 'Failed to check existing RSVP' 
      }
    }
    
    let rsvp
    
    // If RSVP exists, update it, otherwise create a new one
    if (existingRsvp) {
      console.log('Updating existing RSVP:', existingRsvp.id)
      
      const { data: updatedRsvp, error: updateError } = await supabase
        .from('rsvps')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRsvp.id)
        .select()
        .single()
        
      if (updateError) {
        console.error('Failed to update RSVP record:', updateError)
        return { 
          success: false, 
          error: 'Failed to update RSVP record' 
        }
      }
      
      rsvp = updatedRsvp
    } else {
      console.log('Creating new RSVP for invitation:', invitation.id)
      
      // Create new RSVP
      const { data: newRsvp, error: createError } = await supabase
        .from('rsvps')
        .insert({
          invitation_id: invitation.id,
          status: 'accepted',
          guest_count: 1,
          guest_name: invitation.name || null,
          guest_email: invitation.email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
        
      if (createError) {
        console.error('Failed to create RSVP record:', createError)
        return { 
          success: false, 
          error: 'Failed to create RSVP record' 
        }
      }
      
      rsvp = newRsvp
    }
    
    // Update invitation status
    const { error: invitationUpdateError } = await supabase
      .from('invitations')
      .update({ 
        status: 'used',
        rsvp_status: 'accepted',
        rsvp_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id)
      
    if (invitationUpdateError) {
      console.error('Failed to update invitation status:', invitationUpdateError)
      // Not returning error here as the RSVP was created successfully
    }
    
    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        type: 'rsvp_response',
        invitation_id: invitation.id,
        event_id: eventId,
        properties: {
          status: 'accepted',
          timestamp: new Date().toISOString(),
          source: 'web',
          guestCount: 1
        }
      })
    
    return { success: true, rsvp }
  } catch (error) {
    console.error('Error in createOrUpdateRsvp:', error)
    return { 
      success: false, 
      error: 'Failed to process RSVP' 
    }
  }
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

    return invitationData.token
  } catch (error) {
    console.error('Error in getInvitationToken:', error)
    return null
  }
}

export default async function ConfirmedPage({ params }: { params: { slug: string } }) {
  // Get the current token from the URL
  const urlParams = new URL(cookies().get('next-url')?.value || '', 'https://example.com').searchParams
  const token = urlParams.get('token')
  
  // If we have a token, create/update the RSVP
  let rsvpResult: { success: boolean; error?: string | null; rsvp?: any }
  
  if (token) {
    rsvpResult = await createOrUpdateRsvp(params.slug, token)
    console.log('RSVP result:', rsvpResult)
  } else {
    console.log('No token found in URL, skipping RSVP creation')
    rsvpResult = { success: false, error: 'No token found in URL' }
  }
  
  // Get the invitation token for the next steps (profile, camera)
  // If we have a token from URL, use that, otherwise try to get one for the event
  const invitationToken = token || await getInvitationToken(params.slug)
  
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