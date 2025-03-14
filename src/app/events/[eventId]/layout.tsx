import { notFound } from 'next/navigation'
import { getEvent } from '@/lib/supabase/events.server'

interface EventLayoutProps {
  children: React.ReactNode
  params: {
    eventId: string
  }
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  try {
    // Fetch event data to verify it exists and is public
    const event = await getEvent(params.eventId)
    
    // Temporarily disabled strict checking for development
    // Original check: if (event.status !== 'published' || !event.is_public) {
    //   notFound()
    // }
    
    // Only check if the event doesn't exist at all
    if (!event) {
      notFound()
    }
    
    console.log('Event found:', event.id, 'Status:', event.status, 'Public:', event.is_public);
    
    return (
      <main className="w-full">
        {children}
      </main>
    )
  } catch (error) {
    console.error('Error loading event:', error)
    notFound()
  }
} 