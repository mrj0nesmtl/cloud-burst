import { Metadata } from 'next'
import { Shell } from '@/components/shell'
import { CreateInvitationForm } from '@/components/invitations/create-invitation-form'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Create Invitation',
  description: 'Create a new invitation for your event',
}

export default function CreateInvitationPage() {
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
        <CreateInvitationForm />
      </div>
    </Shell>
  )
} 