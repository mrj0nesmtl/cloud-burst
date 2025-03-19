import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Shell } from '@/components/shell'
import { UploadMediaButton } from '@/components/media/upload-media-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Upload Event Photos & Videos',
  description: 'Add your photos and videos to the event gallery',
}

interface InvitationUploadPageProps {
  params: {
    token: string
  }
}

async function getInvitationDetails(token: string) {
  const supabase = createServerComponentClient({ cookies })
  
  // Get invitation with event details
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      *,
      event:events (
        id,
        name,
        date,
        location,
        description,
        organizer:profiles!organizer_id (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('token', token)
    .eq('status', 'used')
    .single()
  
  if (error || !invitation) {
    console.error('Error fetching invitation:', error)
    return null
  }
  
  return invitation
}

export default async function InvitationUploadPage({ params }: InvitationUploadPageProps) {
  const invitation = await getInvitationDetails(params.token)
  
  if (!invitation) {
    notFound()
  }
  
  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle>{invitation.event.name}</CardTitle>
          <CardDescription>
            {formatDate(invitation.event.date)}
            {invitation.event.location && ` at ${invitation.event.location}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose dark:prose-invert">
              <p>
                Welcome! You can upload your photos and videos from {invitation.event.name} here.
                All uploads will be reviewed before appearing in the gallery.
              </p>
              {invitation.event.description && (
                <p>{invitation.event.description}</p>
              )}
            </div>
            
            <div className="flex justify-center">
              <UploadMediaButton
                eventId={invitation.event.id}
                invitationToken={invitation.token}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Shell>
  )
} 