import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { RsvpDashboard } from '@/components/events/rsvp-dashboard'
import { Shell } from '@/components/shell'
import { eventIdSchema } from '@/lib/validations/event'
import { Database } from '@/types/supabase'

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
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  try {
    const eventId = eventIdSchema.parse(params.id)
    
    // Validate event ownership
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', session.user.id)
      .single()
    
    if (error || !event) {
      redirect('/protected/events')
    }
    
    return (
      <Shell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">RSVP Management</h1>
            <p className="text-muted-foreground">Track and manage RSVPs for {event.name}</p>
          </div>
          <RsvpDashboard eventId={eventId} />
        </div>
      </Shell>
    )
  } catch (error) {
    console.error('Error loading RSVP page:', error)
    redirect('/protected/events')
  }
} 