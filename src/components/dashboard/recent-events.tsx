import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistance } from "date-fns"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Users, Image as ImageIcon, ArrowUpRight } from "lucide-react"

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
        borderRadius: '8px'
      }}>
        <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>No recent events</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
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
              padding: '16px', 
              transition: 'all 0.2s',
              cursor: 'pointer',
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'var(--card)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '2px'
            }}
            className="hover:bg-accent/50"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', width: '100%' }}>
                <Avatar style={{ 
                  width: '48px', 
                  height: '48px', 
                  flexShrink: 0, 
                  backgroundColor: 'var(--primary)', 
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div style={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    width: '100%',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}>{event.name}</p>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'var(--muted-foreground)',
                      margin: 0
                    }}>
                      {formatDistance(eventDate, new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    marginTop: '8px' 
                  }}>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--muted)', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <Users className="h-3 w-3 opacity-70" />
                      {event.attendeeCount} attendees
                    </span>
                    <span style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--muted)', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <ImageIcon className="h-3 w-3 opacity-70" />
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