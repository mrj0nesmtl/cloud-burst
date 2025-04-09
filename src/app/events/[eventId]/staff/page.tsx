import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { StaffManagement } from '@/components/admin/staff-management'
import { Metadata } from 'next'

interface EventStaffPageProps {
  params: {
    eventId: string
  }
}

export async function generateMetadata({ params }: EventStaffPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', params.eventId)
    .single()
  
  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    }
  }
  
  return {
    title: `Staff Management | ${event.name} | Cloud Burst`,
    description: `Manage staff members for ${event.name}`,
  }
}

export default async function EventStaffPage({ params }: EventStaffPageProps) {
  const { eventId } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Verify event exists and user has permission to manage it
  const { data: event, error } = await supabase
    .from('events')
    .select('id, name, organizer_id, status')
    .eq('id', eventId)
    .single()
  
  if (error || !event) {
    notFound()
  }
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    notFound()
  }
  
  // Check if user is event organizer, admin, or has staff management permission
  const isOrganizer = event.organizer_id === session.user.id
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  
  // Check if user is event host
  const { data: staffRole } = await supabase
    .from('event_staff')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single()
  
  const isEventHost = staffRole?.role === 'event_host'
  
  // User must be organizer, admin, or event host to manage staff
  if (!isOrganizer && !isAdmin && !isEventHost) {
    notFound()
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-muted-foreground">Staff Management</p>
      </div>
      
      <StaffManagement eventId={eventId} />
    </div>
  )
} 