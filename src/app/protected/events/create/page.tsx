import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventForm } from "@/components/forms/event-form"

export const metadata: Metadata = {
  title: 'Create Event | Cloud Burst',
  description: 'Create a new photography event',
}

export default function CreateEventPage() {
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '100%',
      padding: '0.75rem',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      margin: '0 auto'
    }}>
      <div style={{ 
        marginBottom: '0.75rem'
      }}>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '0.25rem',
          wordBreak: 'break-word',
          lineHeight: 1.3
        }}>
          Create Event
        </h1>
        <p style={{ 
          color: 'var(--muted-foreground)',
          fontSize: '0.75rem',
          lineHeight: 1.4
        }}>
          Enter the details for your new event
        </p>
      </div>
      
      <Card style={{
        width: '100%',
        maxWidth: '100%',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxSizing: 'border-box'
      }}>
        <CardHeader style={{ 
          padding: '0.75rem 0.75rem 0.5rem'
        }}>
          <CardTitle style={{ 
            fontSize: '1rem',
            lineHeight: 1.3
          }}>
            Event Details
          </CardTitle>
          <CardDescription style={{ 
            fontSize: '0.75rem',
            lineHeight: 1.4 
          }}>
            Enter the details for your new event.
          </CardDescription>
        </CardHeader>
        <CardContent style={{ 
          padding: '0 0.75rem 0.75rem',
          maxWidth: '100%'
        }}>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  )
}
