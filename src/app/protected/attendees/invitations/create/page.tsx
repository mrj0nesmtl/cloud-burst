'use client'

import { Shell } from '@/components/shell'
import { CreateInvitationForm } from '@/components/invitations/create-invitation-form'
import { Separator } from '@/components/ui/separator'
import { useSearchParams } from 'next/navigation'

export default function CreateInvitationPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  
  return (
    <Shell>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create Invitation</h1>
        <p className="text-muted-foreground">
          Send an invitation to your event
        </p>
      </div>

      <Separator className="my-4" />

      <div className="mt-8">
        <CreateInvitationForm eventId={eventId || undefined} />
      </div>
    </Shell>
  )
} 