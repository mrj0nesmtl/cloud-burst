import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventForm } from "@/components/forms/event-form"

export const metadata: Metadata = {
  title: 'Create Event | Cloud Burst',
  description: 'Create a new photography event',
}

export default function CreateEventPage() {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Create Event</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Enter the details for your new event
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Enter the details for your new event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  )
}
