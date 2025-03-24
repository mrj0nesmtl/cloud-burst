import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { EventForm } from '@/components/events/event-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Edit Event | Cloud Burst',
  description: 'Edit your event details',
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = params
  
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) notFound()
  
  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!event) notFound()
  
  // Check if user has permission to edit this event
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const isOwner = event.organizer_id === session.user.id
  
  if (!isAdmin && !isOwner) {
    // User doesn't have permission to edit this event
    notFound()
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">
          Update your event details and settings
        </p>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <EventForm 
            initialData={event} 
            userId={session.user.id}
            mode="edit"
          />
        </TabsContent>
        
        <TabsContent value="invitations">
          <div className="bg-white rounded-lg border shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Manage Invitations</h2>
                <p className="text-muted-foreground">Create and manage invitations for this event</p>
              </div>
              <Button asChild>
                <Link href={`/protected/attendees/invitations/create?eventId=${id}`}>
                  Create New Invitation
                </Link>
              </Button>
            </div>
            
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Manage invitations from the dedicated invitations section.
              </p>
              <p className="text-muted-foreground mt-2">
                Click "Create New Invitation" to get started.
              </p>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button variant="outline" asChild>
                <Link href={`/protected/events/${id}`}>
                  View Event Details
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 