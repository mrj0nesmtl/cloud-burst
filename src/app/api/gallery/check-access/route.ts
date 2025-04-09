import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// Input validation schema
const accessCheckSchema = z.object({
  email: z.string().email('Invalid email address'),
  eventId: z.string().uuid('Invalid event ID')
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate request body
    const result = accessCheckSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: result.error.format() 
        },
        { status: 400 }
      )
    }
    
    const { email, eventId } = result.data
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // First check if the gallery is public
    const { data: event } = await supabase
      .from('events')
      .select('is_gallery_public')
      .eq('id', eventId)
      .single()
    
    if (event?.is_gallery_public) {
      // Public gallery - no authentication needed
      return NextResponse.json({ hasAccess: true, isPublic: true })
    }
    
    // Check if user is a guest with access
    const { data: guest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', email)
      .eq('event_id', eventId)
      .single()
    
    if (guest) {
      // User is a known guest with gallery access
      return NextResponse.json({ hasAccess: true, isPublic: false })
    }
    
    // Check if user is an invited guest
    const { data: invitation } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('email', email)
      .eq('event_id', eventId)
      .eq('status', 'sent')
      .single()
    
    if (invitation) {
      // User has an invitation to this event
      return NextResponse.json({ hasAccess: true, isPublic: false, isInvited: true })
    }
    
    // User doesn't have access
    return NextResponse.json({ hasAccess: false, isPublic: false })
    
  } catch (error) {
    console.error('Error checking gallery access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 