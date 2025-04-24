import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' }, 
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Find the most recent invitation for this email
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id, token, email, name')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (invitationError || !invitation) {
      console.error('Invitation lookup error:', invitationError)
      return NextResponse.json(
        { message: 'No invitation found for this email' }, 
        { status: 404 }
      )
    }
    
    // Get event details for the email
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name')
      .eq('id', invitation.event_id)
      .single()
    
    if (eventError) {
      console.error('Event fetch error:', eventError)
      // Continue anyway, we'll just have a generic event name
    }
    
    const eventName = event?.name || 'your event'
    
    // Generate secure dashboard link
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/guest/dashboard?token=${invitation.token}`
    
    // In production, we would send an email with the magic link here
    // For development, we'll just return the link directly
    
    // Mock email sending logic - in production this would call an Edge Function
    /*
    const { error: emailError } = await supabase.functions.invoke('send-guest-magic-link', {
      body: {
        to: email,
        name: invitation.name,
        eventName,
        magicLink: dashboardUrl
      }
    })
    
    if (emailError) {
      console.error('Email sending error:', emailError)
      return NextResponse.json(
        { message: 'Failed to send email' }, 
        { status: 500 }
      )
    }
    */
    
    // For development, just return the link
    return NextResponse.json({
      message: 'Magic link generated successfully',
      dashboardUrl,
      // Include these fields only in development
      ...(process.env.NODE_ENV === 'development' && {
        token: invitation.token,
        eventId: invitation.event_id
      })
    })
    
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 