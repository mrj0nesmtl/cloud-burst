import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ArrowLeft, XCircle, User, Clock, Calendar, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { validateInvitationToken, getEventForInvitation } from '@/lib/supabase/invitations'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    token: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, events(name)')
    .eq('token', params.token)
    .single()
  
  if (!invitation) {
    return {
      title: 'RSVP Confirmation',
      description: 'Thank you for your response.',
    }
  }
  
  const eventName = invitation.events?.name || 'Event'
  
  return {
    title: `RSVP Declined - ${eventName} | Cloud Burst`,
    description: `Your response to ${eventName} has been recorded.`,
  }
}

export default async function DeclinedConfirmationPage({ params }: PageProps) {
  const { token } = params
  
  if (!token) {
    return notFound()
  }
  
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get invitation details
  const invitation = await validateInvitationToken(token)
  
  if (!invitation) {
    return notFound()
  }
  
  // Get event details
  const event = await getEventForInvitation(invitation.event_id)
  
  if (!event) {
    return notFound()
  }
  
  // Get RSVP details
  const { data: rsvp } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitation.id)
    .maybeSingle()
  
  // Get event organizer
  const { data: organizer } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', event.organizer_id || '')
    .single()
  
  // Format event date
  const eventDate = event.date ? formatDate(event.date) : 'Date to be determined'
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="overflow-hidden">
        {event.cover_image_url && (
          <div className="relative w-full h-40 md:h-60">
            <Image
              src={event.cover_image_url}
              alt={event.name || ''}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-3 mb-4 dark:bg-red-900/30">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <CardTitle className="text-2xl md:text-3xl mb-2">{event.name}</CardTitle>
            <CardDescription className="text-lg">
              Your response has been recorded
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Thank you for letting us know</h3>
            <p className="text-center text-muted-foreground mb-4">
              We're sorry you won't be able to attend, but we appreciate your response.
            </p>
            
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link href={`/invitation/${token}`}>
                <Edit className="h-4 w-4" />
                Update My Response
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Date</h4>
                  <p className="text-sm text-muted-foreground">{eventDate}</p>
                </div>
              </div>
              
              {invitation.name && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Invited Guest</h4>
                    <p className="text-sm text-muted-foreground">{invitation.name}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {rsvp?.notes && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Your Message</h4>
                    <p className="text-sm text-muted-foreground">{rsvp.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" asChild>
            <Link href={`/invitation/${token}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Invitation
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 