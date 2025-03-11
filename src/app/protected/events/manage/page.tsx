import { createServerClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from 'lucide-react'
import { EventActions } from '@/components/events/event-actions'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const metadata = {
  title: 'Manage Events | Cloud Burst',
  description: 'Manage your photography events',
}

export default async function ManageEventsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get the user's profile to check their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  // Build the query based on user role
  let query = supabase.from('events').select('*')
  
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
    // Regular users, organizers, and event hosts only see their own events
    query = query.eq('organizer_id', user?.id)
  }
  
  // Execute the query
  const { data: events } = await query.order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <Button asChild>
          <Link href="/protected/events/create">Create Event</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>
            View and manage all your photography events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-md p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{event.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{event.location}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{event.status}</span>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{event.description}</p>
                    </div>
                    <EventActions eventId={event.id} organizerId={event.organizer_id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="font-medium text-lg">No events found</h3>
              <p className="text-muted-foreground mt-1">Create your first event to get started.</p>
              <Button className="mt-4" asChild>
                <Link href="/protected/events/create">Create Event</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
