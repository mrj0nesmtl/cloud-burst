import { Metadata, ResolvingMetadata } from 'next/types'
import Link from 'next/link'
import { Check, Calendar, Share, Camera, User } from 'lucide-react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/types/supabase'
import { redirect } from 'next/navigation'

// Define metadata for the page
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  return {
    title: 'RSVP Confirmed',
    description: 'Your RSVP has been confirmed successfully',
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Environment variables for Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Function to create or update RSVP record
async function createOrUpdateRsvp(
  supabaseAdmin: ReturnType<typeof createClient>,
  invitation: any,
  eventId: string
) {
  try {
    console.log(`[RSVP-DEBUG] Creating or updating RSVP for invitation: ${invitation.id}`)
    
    // Check if RSVP already exists
    const { data: existingRsvpData, error: existingError } = await supabaseAdmin
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitation.id)
      .maybeSingle()
      
    if (existingError && existingError.code !== 'PGRST116') {
      console.error(`[RSVP-ERROR] Error checking existing RSVP: ${JSON.stringify(existingError)}`)
      return { 
        success: false, 
        error: `Failed to check existing RSVP: ${existingError.message}` 
      }
    }
    
    let rsvp = null
    
    // Update existing RSVP if found
    if (existingRsvpData) {
      console.log(`[RSVP-DEBUG] Found existing RSVP: ${existingRsvpData.id}`)
      
      const updateData = {
        status: 'accepted',
        updated_at: new Date().toISOString()
      }
      
      console.log(`[RSVP-DEBUG] Updating RSVP with data: ${JSON.stringify(updateData)}`)
      
      const { data: updatedRsvp, error: updateError } = await supabaseAdmin
        .from('rsvps')
        .update(updateData)
        .eq('id', existingRsvpData.id)
        .select()
        .single()
        
      if (updateError) {
        console.error(`[RSVP-ERROR] Failed to update RSVP: ${JSON.stringify(updateError)}`)
        return { 
          success: false, 
          error: `Failed to update RSVP: ${updateError.message}` 
        }
      }
      
      console.log(`[RSVP-DEBUG] Successfully updated RSVP`)
      rsvp = updatedRsvp
    } else {
      // Create new RSVP
      console.log(`[RSVP-DEBUG] No existing RSVP found, creating new one`)
      
      // Generate a proper UUID for the RSVP
      const rsvpId = uuidv4()
      
      const rsvpData = {
        id: rsvpId,
        invitation_id: invitation.id,
        event_id: eventId,
        name: invitation.name || '',
        email: invitation.email || '',
        status: 'accepted',
        guest_count: invitation.guest_count || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log(`[RSVP-DEBUG] Creating RSVP with data: ${JSON.stringify(rsvpData)}`)
      
      const { data: newRsvp, error: insertError } = await supabaseAdmin
        .from('rsvps')
        .insert(rsvpData)
        .select()
        .single()
        
      if (insertError) {
        console.error(`[RSVP-ERROR] Error creating RSVP: ${JSON.stringify(insertError)}`)
        return { 
          success: false, 
          error: `Failed to create RSVP: ${insertError.message}` 
        }
      }
      
      console.log(`[RSVP-DEBUG] Successfully created RSVP: ${newRsvp.id}`)
      rsvp = newRsvp
    }
    
    // Update invitation status to confirmed
    console.log(`[RSVP-DEBUG] Updating invitation status to confirmed`)
    const { error: invitationUpdateError } = await supabaseAdmin
      .from('invitations')
      .update({ 
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id)
      
    if (invitationUpdateError) {
      console.error(`[RSVP-ERROR] Error updating invitation status: ${JSON.stringify(invitationUpdateError)}`)
      // We'll continue even if this fails, as the RSVP is already created/updated
    } else {
      console.log(`[RSVP-DEBUG] Successfully updated invitation status`)
    }
    
    // Create an analytics event for the RSVP
    try {
      console.log(`[RSVP-DEBUG] Creating analytics event for RSVP`)
      
      const analyticsData = {
        event_type: 'rsvp_confirmed',
        event_id: eventId,
        user_id: null,
        invitation_id: invitation.id,
        rsvp_id: rsvp.id,
        metadata: {
          rsvp_status: 'accepted',
          guest_count: rsvp.guest_count
        },
        created_at: new Date().toISOString()
      }
      
      const { error: analyticsError } = await supabaseAdmin
        .from('analytics_events')
        .insert(analyticsData)
        
      if (analyticsError) {
        console.error(`[RSVP-ERROR] Error creating analytics event: ${JSON.stringify(analyticsError)}`)
      } else {
        console.log(`[RSVP-DEBUG] Successfully created analytics event`)
      }
    } catch (analyticsError) {
      console.error(`[RSVP-ERROR] Unhandled error creating analytics event: ${analyticsError}`)
      // Continue even if analytics fails
    }
    
    console.log(`[RSVP-DEBUG] RSVP confirmation process completed successfully`)
    return { success: true, rsvp }
  } catch (error) {
    console.error(`[RSVP-ERROR] Unhandled error in createOrUpdateRsvp: ${error}`)
    return { 
      success: false, 
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` 
    }
  }
}

// Helper function to extract invitation token from referer or cookies
async function getInvitationToken(eventId: string): Promise<string | null> {
  try {
    let token: string | null = null;
    
    // First try to get token from referer URL
    const requestHeaders = headers();
    const referer = requestHeaders.get('referer') || '';
    console.log(`[RSVP-DEBUG] Referer: ${referer}`);
    
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        token = refererUrl.searchParams.get('token');
        console.log(`[RSVP-DEBUG] Token from referer URL: ${token || 'not found'}`);
      } catch (error) {
        console.error(`[RSVP-ERROR] Error parsing referer URL: ${error}`);
      }
    }
    
    // If no token in referer, try cookies
    if (!token) {
      const nextUrl = cookies().get('next-url')?.value;
      
      if (nextUrl) {
        try {
          const url = new URL(nextUrl, 'https://example.com');
          token = url.searchParams.get('token');
          console.log(`[RSVP-DEBUG] Token from cookies: ${token || 'not found'}`);
        } catch (error) {
          console.error(`[RSVP-ERROR] Error parsing URL from cookies: ${error}`);
        }
      }
    }
    
    // If still no token, try to get from cookies directly
    if (!token) {
      token = cookies().get('invitation_token')?.value || null;
      console.log(`[RSVP-DEBUG] Token from direct cookie: ${token || 'not found'}`);
    }
    
    return token;
  } catch (error) {
    console.error(`[RSVP-ERROR] Error getting invitation token: ${error}`);
    return null;
  }
}

// Create a ConfirmedLayout component here since it doesn't exist yet
function ConfirmedLayout({ 
  event, 
  invitation,
  rsvp 
}: { 
  event: any;
  invitation: any;
  rsvp: any;
}) {
  // Prepare query params for profile and camera setup
  const queryParams = new URLSearchParams();
  queryParams.set('token', invitation.token);
  
  const profileUrl = `/guest/profile?${queryParams}`;
  const cameraUrl = `/guest/camera-setup?${queryParams}`;
  
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
            href={`/event/${event.slug}`}
            className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-md w-full"
          >
            <Calendar className="mr-2 h-5 w-5" />
            View Event Details
          </Link>
          
          <Link 
            href={`/event/${event.slug}/share`}
            className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-md w-full"
          >
            <Share className="mr-2 h-5 w-5" />
            Share With Friends
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ConfirmedPage({
  params
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const supabase = createClient()
  const supabaseAdmin = createClient()
  
  console.log(`[RSVP-DEBUG] Loading confirmation page for event: ${slug}`)
  
  try {
    // Get the event by slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single()
      
    if (eventError || !event) {
      console.error(`[RSVP-ERROR] Error fetching event: ${JSON.stringify(eventError)}`)
      redirect(`/event/${slug}/not-found`)
    }
    
    console.log(`[RSVP-DEBUG] Found event: ${event.id}`)
    
    // Get invitation token from referer or cookie
    const token = await getInvitationToken(event.id)
    
    if (!token) {
      console.error(`[RSVP-ERROR] No invitation token found`)
      redirect(`/event/${slug}/not-found`)
    }
    
    console.log(`[RSVP-DEBUG] Using invitation token: ${token}`)
    
    // Get the invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single()
      
    if (invitationError || !invitation) {
      console.error(`[RSVP-ERROR] Error fetching invitation: ${JSON.stringify(invitationError)}`)
      redirect(`/event/${slug}/not-found`)
    }
    
    console.log(`[RSVP-DEBUG] Found invitation: ${invitation.id}`)
    
    // Create or update RSVP record
    const { success, rsvp, error: rsvpError } = await createOrUpdateRsvp(
      supabaseAdmin,
      invitation,
      event.id
    )
    
    if (!success || !rsvp) {
      console.error(`[RSVP-ERROR] Failed to create/update RSVP: ${rsvpError || 'Unknown error'}`)
      redirect(`/event/${slug}/error?message=Failed to confirm RSVP`)
    }
    
    // Return the confirmation page
    return (
      <ConfirmedLayout 
        event={event} 
        invitation={invitation} 
        rsvp={rsvp} 
      />
    )
  } catch (error) {
    console.error(`[RSVP-ERROR] Unhandled error in confirmation page: ${error}`)
    redirect(`/event/${slug}/error?message=An unexpected error occurred`)
  }
}