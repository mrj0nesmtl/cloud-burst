import { redirect } from 'next/navigation'
import { Upload } from 'lucide-react'
import { getUserAuth } from '@/lib/auth/utils'
import { getEventById } from '@/lib/supabase/events.server'
import { UploadContent } from './upload-content'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface UploadPageProps {
  searchParams: {
    eventId?: string
  }
}

export default async function UploadPage({
  searchParams,
}: UploadPageProps) {
  // Get the current user
  const { user } = await getUserAuth()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Check if eventId is provided
  if (!searchParams.eventId) {
    redirect('/protected/gallery/events')
  }
  
  let eventId = searchParams.eventId
  
  // Handle the 'recent' special value for eventId
  if (eventId === 'recent') {
    // Get the most recent event for this user
    const supabase = createServerComponentClient({ cookies })
    const { data: events } = await supabase
      .from('events')
      .select('id, name, date')
      .eq('organizer_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
    
    if (!events || events.length === 0) {
      // No events found, redirect to create one
      redirect('/protected/events/create?from=upload')
    }
    
    eventId = events[0].id
  }
  
  // Get the event data
  const event = await getEventById(eventId)
  
  // If event not found, redirect to gallery
  if (!event) {
    redirect('/protected/gallery/events')
  }
  
  return (
    <div className="p-6 w-full space-y-6">
      {/* Upload page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Upload Media</h1>
          <p className="text-muted-foreground">
            Upload photos and videos to the "{event.name}" event
          </p>
        </div>
        <div className="flex space-x-2">
          <a 
            href={`/events/${event.id}/gallery`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            View Gallery
          </a>
        </div>
      </div>
      
      {/* Upload content */}
      <UploadContent eventId={event.id} userId={user.id} />
    </div>
  )
} 