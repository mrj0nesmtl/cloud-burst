import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { RsvpDashboard } from '@/components/dashboard/RsvpDashboard'
import { Shell } from '@/components/shell'
import { Database } from '@/types/supabase'

// Define event ID schema directly since there's an import error
const eventIdSchema = z.string().uuid("Event ID must be a valid UUID")

export const metadata: Metadata = {
  title: 'RSVP Management',
  description: 'Track and manage event RSVPs',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function RsvpPage({ params }: PageProps) {
  console.log('RsvpPage - Starting with ID:', params.id);
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    console.log('RSVP page: No session found, redirecting to login')
    redirect('/login')
  }
  
  try {
    console.log('RsvpPage - Validating event ID');
    let eventId;
    try {
      eventId = eventIdSchema.parse(params.id)
      console.log('RsvpPage - Event ID validated successfully');
    } catch (parseError) {
      console.error('RsvpPage - Invalid event ID format:', parseError);
      redirect('/protected/events');
    }
    
    console.log('RsvpPage - Checking if event exists');
    // Check if event exists first, regardless of ownership
    const { data: eventExists, error: eventExistsError } = await supabase
      .from('events')
      .select('id, name, user_id')
      .eq('id', eventId)
      .single()
    
    if (eventExistsError) {
      console.error('RsvpPage - Event query error:', eventExistsError);
      redirect('/protected/events')
    }
    
    if (!eventExists) {
      console.log(`RsvpPage - Event not found - ${eventId}`);
      redirect('/protected/events')
    }
    
    console.log('RsvpPage - Event found:', eventExists.name);
    
    // Get user profile to check if user is admin (admins can view all events)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const isAdmin = userProfile?.role === 'admin'
    console.log('RsvpPage - User is admin:', isAdmin);
    
    // If user is not admin, check event ownership
    if (!isAdmin && eventExists.user_id !== session.user.id) {
      console.log(`RsvpPage - User ${session.user.id} does not have access to event ${eventId} owned by ${eventExists.user_id}`);
      redirect('/protected/events')
    }
    
    console.log('RsvpPage - Access granted, rendering component');
    return (
      <Shell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">RSVP Management</h1>
            <p className="text-muted-foreground">Track and manage RSVPs for {eventExists.name}</p>
          </div>
          <RsvpDashboard eventId={eventId} />
        </div>
      </Shell>
    )
  } catch (error) {
    console.error('Error loading RSVP page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
    }
    redirect('/protected/events')
  }
} 