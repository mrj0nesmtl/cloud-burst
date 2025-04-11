import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createGuestAccount, generateGuestLoginLink } from '@/lib/supabase/auth-utils'
import { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Missing invitation token' },
      { status: 400 }
    )
  }

  try {
    // Initialize Supabase server client using createServerComponentClient directly
    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Lookup the invitation
    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, email, name, status, expires_at, metadata')
      .eq('token', token)
      .single()
    
    if (invitationError || !invitationData) {
      console.error('Invitation lookup error:', invitationError)
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
    }
    
    // Check if invitation is valid and not expired
    const now = new Date()
    const expiresAt = invitationData.expires_at ? new Date(invitationData.expires_at) : null
    
    if (
      invitationData.status === 'expired' || 
      (expiresAt && now > expiresAt)
    ) {
      // Update status to expired if it's not already marked as such
      if (invitationData.status !== 'expired') {
        await supabase
          .from('invitations')
          .update({ status: 'expired' })
          .eq('id', invitationData.id)
      }
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }
    
    // Check if this is a new user or returning user
    // Note: This may not have admin access, so use a simple email check
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', invitationData.email || '')
      .maybeSingle()
    
    let userId = existingUsers?.id || null
    let loginLink = null
    
    // If user doesn't exist, create a guest account
    if (!userId && invitationData.email) {
      const guestAccountResult = await createGuestAccount(
        invitationData.email,
        invitationData.name || '',
        invitationData.event_id,
        invitationData.id
      )
      
      if (guestAccountResult.error) {
        console.error('Error creating guest account:', guestAccountResult.error)
      } else if (guestAccountResult.user) {
        userId = guestAccountResult.user.id
        
        // Generate a magic login link
        loginLink = await generateGuestLoginLink(
          invitationData.email,
          invitationData.event_id
        )
      }
    } else if (userId && invitationData.email) {
      // Check if the user is already an attendee for this event
      const { data: attendeeData, error: attendeeError } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', invitationData.event_id)
        .eq('user_id', userId)
        .single()
      
      // If not an attendee yet, add them
      if (!attendeeData && !attendeeError) {
        await supabase
          .from('event_attendees')
          .insert({
            event_id: invitationData.event_id,
            user_id: userId,
            invitation_id: invitationData.id,
            name: invitationData.name || '',
            email: invitationData.email,
            status: 'confirmed'
          })
      }
      
      // Generate a magic login link for returning users too
      loginLink = await generateGuestLoginLink(
        invitationData.email,
        invitationData.event_id
      )
    }
    
    // Update invitation status to 'used' unless it's already 'confirmed'
    if (invitationData.status !== 'confirmed') {
      await supabase
        .from('invitations')
        .update({ status: 'used' })
        .eq('id', invitationData.id)
    }
    
    // Return success with event ID and login link if available
    return NextResponse.json({
      success: true,
      eventId: invitationData.event_id,
      loginLink: loginLink,
      isNewUser: !userId
    })
  } catch (error) {
    console.error('Invitation validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    )
  }
} 