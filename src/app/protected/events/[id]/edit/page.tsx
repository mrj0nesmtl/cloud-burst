import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { EventForm } from '@/components/events/event-form'

export const metadata: Metadata = {
  title: 'Edit Event | Cloud Burst',
  description: 'Edit your event details',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = params
  
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) notFound()
  
  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!event) notFound()
  
  // Check if user has permission to edit this event
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isOwner = event.organizer_id === session.user.id
  
  if (!isAdmin && !isOwner) {
    // User doesn't have permission to edit this event
    notFound()
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">
          Update your event details and settings
        </p>
      </div>
      
      <EventForm 
        initialData={event} 
        userId={session.user.id}
        mode="edit"
      />
    </div>
  )
} 