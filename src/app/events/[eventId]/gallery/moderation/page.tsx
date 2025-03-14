import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'

import { getUserAuth } from '@/lib/auth/utils'
import { getEventById } from '@/lib/supabase/events'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ModerationContent } from './moderation-content'

interface ModerationPageProps {
  params: {
    eventId: string
  }
}

/**
 * Page for moderating media uploads for an event
 */
export default async function ModerationPage({ params }: ModerationPageProps) {
  // Get current user
  const { session } = await getUserAuth()
  if (!session) {
    redirect('/login?callbackUrl=/events/' + params.eventId + '/gallery/moderation')
  }
  
  // Get event data
  const event = await getEventById(params.eventId)
  if (!event) {
    redirect('/events')
  }
  
  // Check if user is the organizer
  const isOrganizer = event.organizer_id === session.user.id
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Moderation</h1>
          <p className="text-muted-foreground">
            {event.title} - Review and approve media uploads
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Back to Gallery
          </Button>
        </div>
      </div>
      
      {isOrganizer ? (
        <ModerationContent 
          eventId={params.eventId} 
          userId={session.user.id}
          isOrganizer={isOrganizer}
        />
      ) : (
        <EmptyState
          icon={<Shield className="h-10 w-10 text-muted-foreground" />}
          title="Access Restricted"
          description="Only event organizers can access the moderation page."
          action={
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Back to Gallery
            </Button>
          }
        />
      )}
    </div>
  )
} 