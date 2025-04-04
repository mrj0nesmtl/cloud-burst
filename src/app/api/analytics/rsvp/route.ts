import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Define schema for tracking RSVP analytics
const rsvpAnalyticsSchema = z.object({
  invitationId: z.string().uuid(),
  status: z.enum(['accepted', 'declined', 'pending']),
  timestamp: z.string().datetime(),
  source: z.string().optional(),
  details: z.record(z.string(), z.any()).optional()
})

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Parse and validate request body
    const body = await request.json()
    const data = rsvpAnalyticsSchema.parse(body)
    
    // Get user session if available
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    
    // Record the analytics event
    const { data: analyticsData, error } = await supabase
      .from('analytics_events')
      .insert({
        type: 'rsvp_response',
        user_id: userId || null,
        invitation_id: data.invitationId,
        properties: {
          status: data.status,
          timestamp: data.timestamp,
          source: data.source || 'web',
          ...data.details
        }
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error recording RSVP analytics:', error)
      return NextResponse.json(
        { error: 'Failed to record analytics' },
        { status: 500 }
      )
    }
    
    // Also update the invitation record with the response status
    await supabase
      .from('invitations')
      .update({
        rsvp_status: data.status,
        rsvp_date: data.timestamp,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.invitationId)
    
    return NextResponse.json({
      success: true,
      trackingId: analyticsData?.id
    })
  } catch (error) {
    console.error('RSVP analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 