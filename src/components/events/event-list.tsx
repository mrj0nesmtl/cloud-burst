import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Calendar, MapPin, Clock, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EventWithCounts } from '@/types/events'
import { formatDate } from '@/lib/utils'
import { EnhancedEventCard } from '@/components/events/enhanced-event-card'

interface EventListProps {
  events: EventWithCounts[]
  variant?: 'default' | 'compact'
  emptyMessage?: string
  onDelete?: (id: string) => Promise<void>
  onDuplicate?: (id: string) => Promise<void>
}

export function EventList({
  events,
  variant = 'default',
  emptyMessage = 'No events found',
  onDelete,
  onDuplicate
}: EventListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg border border-dashed">
        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
        <p className="text-muted-foreground mt-2 mb-4 max-w-md">
          Events you create will appear here. Create your first event to get started.
        </p>
        <Button asChild>
          <Link href="/protected/events/create">Create an Event</Link>
        </Button>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {events.map((event) => (
          <Link 
            key={event.id} 
            href={`/protected/events/${event.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Thumbnail preview */}
              {event.cover_image_url ? (
                <div className="relative h-12 w-12 rounded-md overflow-hidden border flex-shrink-0">
                  <Image 
                    src={event.cover_image_url} 
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md border flex-shrink-0"
                     style={{
                      backgroundColor: 
                        event.status === 'published' ? 'var(--green-500)' : 
                        event.status === 'draft' ? 'var(--orange-500)' : 
                        event.status === 'completed' ? 'var(--blue-500)' : 
                        event.status === 'cancelled' ? 'var(--destructive)' : 
                        'var(--primary)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                  {event.name
                    .split(' ')
                    .map(part => part[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </div>
              )}
              
              <div>
                <div className="font-medium">{event.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.date)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={event.status} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    )
  }

  // Default card view with grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EnhancedEventCard
          key={event.id}
          event={event}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'published':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Live</Badge>
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    case 'completed':
      return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
    case 'archived':
      return <Badge variant="default" className="bg-gray-500 hover:bg-gray-600">Archived</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return null
  }
} 