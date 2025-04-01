import { Metadata } from 'next'
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
      padding: '24px',
      boxSizing: 'border-box',
      margin: '0 auto'
    }}>
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          lineHeight: 1.2,
          color: 'var(--foreground)'
        }}>
          Create Event
        </h1>
        <p style={{ 
          color: 'var(--muted-foreground)',
          fontSize: '16px',
          lineHeight: 1.5
        }}>
          Enter the details for your new event
        </p>
      </div>
      
      <EventForm />
    </div>
  )
}
