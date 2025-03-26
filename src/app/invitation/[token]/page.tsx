import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RsvpForm } from './rsvp-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface InvitationPageProps {
  params: {
    token: string
  }
}

export async function generateMetadata({ params }: InvitationPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, events(name)')
    .eq('token', params.token)
    .single()
  
  if (!invitation) {
    return {
      title: 'Invitation Not Found',
      description: 'The requested invitation could not be found.',
    }
  }
  
  const eventName = invitation.events?.name || 'Event'
  
  return {
    title: `You're invited to ${eventName} | Cloud Burst`,
    description: `Respond to your invitation for ${eventName}`,
  }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Get invitation with event data
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      *,
      events:event_id(
        id,
        name,
        description,
        date,
        location,
        organizer_id,
        profiles:organizer_id(full_name, email)
      )
    `)
    .eq('token', token)
    .single()
  
  if (error || !invitation) {
    console.error('Error fetching invitation:', error)
    notFound()
  }

  const event = invitation.events
  const organizer = event?.profiles
  const eventDate = event?.date ? format(new Date(event.date), 'EEEE, MMMM d, yyyy') : 'Date to be announced'
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center border-b px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Cloud Burst" width={36} height={36} />
          <span className="text-lg font-semibold">Cloud Burst</span>
        </Link>
      </header>
      
      {/* Main content */}
      <main className="flex-1 py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-8">
            {/* Invitation card */}
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-muted/50 text-center">
                <CardTitle className="text-2xl font-bold text-primary">
                  You're invited to {event?.name}!
                </CardTitle>
                <CardDescription>
                  {invitation.name}, please respond to your invitation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-2 space-y-6">
                {/* Event details */}
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card px-4 py-3 text-center">
                    <h3 className="font-semibold">{event?.name}</h3>
                    <p className="text-sm text-muted-foreground">{eventDate}</p>
                    {event?.location && (
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    )}
                  </div>
                  
                  {event?.description && (
                    <div>
                      <p className="text-sm mb-2">
                        {event.description}
                      </p>
                    </div>
                  )}
                  
                  {invitation.metadata?.message && (
                    <div className="border-l-4 border-primary/20 pl-4 py-2 italic">
                      <p className="text-sm">"{invitation.metadata.message}"</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {organizer?.full_name || 'Your host'}
                      </p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* RSVP Form */}
                <RsvpForm invitation={invitation} />
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground border-t bg-muted/30 px-6 py-4">
                <p>
                  This is a personal invitation for {invitation.name}.
                </p>
                <p>
                  Questions? Contact the event organizer at{' '}
                  <a 
                    href={`mailto:${organizer?.email || 'contact@cloudburst.app'}`}
                    className="text-primary underline"
                  >
                    {organizer?.email || 'contact@cloudburst.app'}
                  </a>
                </p>
              </CardFooter>
            </Card>
            
            {/* Gallery access card - show if event has a gallery */}
            {invitation.status === 'accepted' && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Gallery</CardTitle>
                  <CardDescription>
                    Access photos from this event
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Link href={`/gallery/${event?.id}`} passHref>
                    <Button>
                      View Event Gallery
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cloud Burst. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            <a href="/privacy" className="underline">Privacy Policy</a>
            {' • '}
            <a href="/terms" className="underline">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  )
} 