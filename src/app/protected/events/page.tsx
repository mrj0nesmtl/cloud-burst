import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Events | Cloud Burst',
  description: 'Manage your photo events',
}

export default async function EventsPage() {
  const supabase = await createServerClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/protected/events/create">Create Event</Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {events && events.length > 0 ? (
            <div className="grid gap-4">
              {/* Event list will go here */}
              {events.map((event) => (
                <div key={event.id} className="border rounded-md p-4">
                  <h3 className="font-medium">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No events found. Create your first event to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
