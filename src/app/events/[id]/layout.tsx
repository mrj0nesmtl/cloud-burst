import { notFound } from 'next/navigation'
import { getEvent } from '@/lib/supabase/events'

interface EventLayoutProps {
  children: React.ReactNode
  params: {
    id: string
  }
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  try {
    // Fetch event data to verify it exists and is public
    const event = await getEvent(params.id)
    
    // Check if event is published and public
    if (event.status !== 'published' || !event.is_public) {
      notFound()
    }
    
    return (
      <div>
        {children}
      </div>
    )
  } catch (error) {
    console.error('Error loading event:', error)
    notFound()
  }
} 