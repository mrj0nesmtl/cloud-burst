'use client'

import { Shell } from '@/components/shell'
import { CreateInvitationForm } from '@/components/invitations/create-invitation-form'
import { Separator } from '@/components/ui/separator'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Mail } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'
import { useEffect, useState } from 'react'

export default function CreateInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventId = searchParams.get('eventId')
  const [eventName, setEventName] = useState<string | null>(null)
  const { data: events } = useEvents()
  
  useEffect(() => {
    if (eventId && events) {
      const event = events.find(e => e.id === eventId)
      if (event) {
        setEventName(event.name)
      }
    }
  }, [eventId, events])
  
  return (
    <Shell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {eventName ? `Invite Guests to ${eventName}` : 'Create Invitation'}
            </h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Send personalized invitations to your guests with unique access links
          </p>
        </div>
        {eventId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/protected/events/${eventId}`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            View Event Details
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="mt-8">
        <CreateInvitationForm eventId={eventId || undefined} />
      </div>
    </Shell>
  )
} 