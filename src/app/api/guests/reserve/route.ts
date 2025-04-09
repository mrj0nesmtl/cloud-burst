import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Input validation schema
const guestReservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  eventId: z.string().uuid("Invalid event ID"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const result = guestReservationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid form data', 
          details: result.error.format() 
        },
        { status: 400 }
      )
    }
    
    const { name, email, phone, eventId } = result.data
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Check if guest already exists for this event
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', email)
      .eq('event_id', eventId)
      .single()
    
    if (existingGuest) {
      // Guest already registered, but we'll return success anyway
      // to prevent enumeration attacks
      return NextResponse.json({ success: true })
    }
    
    // Create access token for the guest
    const accessToken = uuidv4()
    
    // Insert guest record
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .insert({
        name,
        email,
        phone: phone || null,
        event_id: eventId,
        access_token: accessToken,
        status: 'registered'
      })
      .select('id')
      .single()
    
    if (guestError) {
      console.error('Error creating guest:', guestError)
      return NextResponse.json(
        { error: 'Failed to create guest reservation' },
        { status: 500 }
      )
    }
    
    // Add gallery access permission for this guest
    await supabase
      .from('gallery_permissions')
      .insert({
        guest_id: guest.id,
        event_id: eventId,
        permission_level: 'view',
        can_upload: true,
        expires_at: null // No expiration for now
      })
    
    // Log registration analytics
    try {
      await supabase.rpc('track_guest_registration', {
        p_event_id: eventId,
        p_guest_email: email,
        p_referrer: request.headers.get('referer') || 'direct'
      })
    } catch (error: unknown) {
      // Don't fail if analytics fails
      console.error('Analytics error:', error)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling guest reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 