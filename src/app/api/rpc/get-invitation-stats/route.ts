import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const requestSchema = z.object({
  eventId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get and validate the event ID
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    const result = requestSchema.safeParse({ eventId })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      )
    }
    
    // Verify user has permission to access this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single()
      
    if (eventError) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    if (event.organizer_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this event' },
        { status: 403 }
      )
    }
    
    // Get invitations for the event with counts by status
    const { data: statusCounts, error: countsError } = await supabase
      .from('invitations')
      .select('status, count')
      .eq('event_id', eventId)
      .group('status')
    
    if (countsError) {
      console.error('Error getting invitation counts:', countsError)
      return NextResponse.json(
        { error: 'Error fetching invitation statistics' },
        { status: 500 }
      )
    }
    
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    
    if (totalError) {
      console.error('Error getting total count:', totalError)
      return NextResponse.json(
        { error: 'Error fetching invitation statistics' },
        { status: 500 }
      )
    }
    
    // Process the status counts
    const stats = {
      total: totalCount || 0,
      pending: 0,
      sent: 0,
      opened: 0,
      accepted: 0,
      declined: 0,
      draft: 0,
    }
    
    // Map the raw counts to our stats object
    statusCounts?.forEach((item) => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats] = parseInt(item.count)
      }
    })
    
    // Get analytics data for this event's invitations
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics_events')
      .select(`
        id,
        type,
        created_at,
        properties,
        invitations(
          id,
          email,
          name,
          status,
          event_id
        )
      `)
      .eq('type', 'rsvp_response')
      .in('invitation_id', supabase.from('invitations').select('id').eq('event_id', eventId))
    
    if (analyticsError) {
      console.error('Error getting analytics data:', analyticsError)
      // We'll continue even if analytics fails
    }
    
    // Calculate response times if analytics data is available
    let avgResponseTime = null
    if (analyticsData && analyticsData.length > 0) {
      const responseTimes = analyticsData
        .filter(item => item.invitations && item.properties && item.properties.timestamp)
        .map(item => {
          try {
            const responseTime = new Date(item.properties.timestamp).getTime() - 
              new Date(item.invitations.created_at).getTime()
            // Convert to hours
            return responseTime / (1000 * 60 * 60)
          } catch (e) {
            return null
          }
        })
        .filter(Boolean) as number[]
      
      if (responseTimes.length > 0) {
        avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      }
    }
    
    return NextResponse.json({
      stats,
      analytics: {
        averageResponseTime: avgResponseTime ? Math.round(avgResponseTime * 10) / 10 : null, // In hours, rounded to 1 decimal
        responseSource: analyticsData
          ?.filter(item => item.properties && item.properties.source)
          .reduce((acc, item) => {
            const source = item.properties.source as string
            acc[source] = (acc[source] || 0) + 1
            return acc
          }, {} as Record<string, number>) || {},
      }
    })
  } catch (error) {
    console.error('Error getting invitation stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 