import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistance } from "date-fns"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface Event {
  id: string
  name: string
  date: string
  attendeeCount: number
  photoCount: number
}

interface RecentEventsProps {
  events: Event[]
}

export function RecentEvents({ events }: RecentEventsProps) {
  if (events.length === 0) {
    return (
      <div style={{
        display: 'flex',
        height: '180px',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed var(--border)',
        borderRadius: '6px'
      }}>
        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>No recent events</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {events.map((event) => {
        const eventDate = new Date(event.date)
        const initials = event.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)

        return (
          <Link 
            href={`/protected/events/${event.id}`} 
            key={event.id}
            style={{ display: 'block', touchAction: 'manipulation', width: '100%' }}
          >
            <Card style={{ 
              padding: '8px', 
              transition: 'background 0.2s',
              cursor: 'pointer',
              width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                <Avatar style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                  <AvatarFallback style={{ fontSize: '10px' }}>{initials}</AvatarFallback>
                </Avatar>
                <div style={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    width: '100%',
                    gap: '4px'
                  }}>
                    <p style={{ 
                      fontSize: '12px', 
                      fontWeight: 500, 
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%'
                    }}>{event.name}</p>
                    <p style={{ 
                      fontSize: '10px', 
                      color: 'var(--muted-foreground)',
                      margin: 0
                    }}>
                      {formatDistance(eventDate, new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '4px', 
                    marginTop: '4px' 
                  }}>
                    <span style={{ 
                      backgroundColor: 'var(--muted)', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px' 
                    }}>
                      {event.attendeeCount} attendees
                    </span>
                    <span style={{ 
                      backgroundColor: 'var(--muted)', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px' 
                    }}>
                      {event.photoCount} photos
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
} 