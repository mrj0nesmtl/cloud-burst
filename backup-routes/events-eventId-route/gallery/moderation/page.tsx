import { redirect } from 'next/navigation'
import { ShieldAlert, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { getUserAuth } from '@/lib/auth/utils'
import { getEventById } from '@/lib/supabase/events'
import { hasRole } from '@/lib/auth/utils'
import { Suspense } from 'react'
import ModerationContent from './moderation-content'

interface ModerationPageProps {
  params: {
    eventId: string
  }
}

/**
 * Page for moderating media uploads for an event
 */
export default async function ModerationPage({ params }: ModerationPageProps) {
  // Get user auth
  const auth = await getUserAuth()
  
  // If not logged in, redirect to login
  if (!auth.session?.user) {
    redirect('/login?callbackUrl=/events/' + params.eventId + '/gallery/moderation')
  }

  const user = auth.session.user
  
  // Get event data
  const event = await getEventById(params.eventId)
  
  // If event not found, redirect to gallery
  if (!event) {
    redirect('/events')
  }
  
  // Check if user is organizer
  const isOrganizer = event.organizer_id === user.id || hasRole(user, 'admin')
  
  // If not organizer, redirect to gallery
  if (!isOrganizer) {
    redirect(`/events/${params.eventId}/gallery`)
  }
  
  return (
    <div className="container max-w-screen-xl py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Moderation</h1>
          <p className="text-muted-foreground">
            Manage uploads for {event.name}
          </p>
        </div>
        
        <Button variant="outline" size="sm" asChild>
          <a href={`/events/${params.eventId}/gallery`}>
            <Eye className="mr-2 h-4 w-4" />
            View Gallery
          </a>
        </Button>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <ModerationContent
          eventId={params.eventId}
          userId={user.id}
          isOrganizer={isOrganizer}
        />
      </Suspense>
    </div>
  )
} 