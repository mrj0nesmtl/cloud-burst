import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistance } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Image as ImageIcon, ArrowUpRight, CalendarIcon, ChevronRightIcon, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Event {
  id: string
  name: string
  date: string
  status?: string
  location?: string
  cover_image_url?: string | null
  attendeeCount?: number
  photoCount?: number
}

interface RecentEventsProps {
  events: Event[]
}

export function RecentEvents({ events }: RecentEventsProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] py-8 px-4 text-center rounded-lg border border-dashed border-muted">
        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No events found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Create your first event to get started
        </p>
        <Button asChild>
          <Link href="/protected/events/create">Create Event</Link>
        </Button>
      </div>
    )
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link 
          key={event.id} 
          href={`/protected/events/${event.id}`}
          className="block transition-colors hover:bg-accent/30 rounded-lg"
        >
          <div className="flex items-start p-3 gap-4">
            {/* Thumbnail with hover effect */}
            <div className="relative flex-shrink-0 overflow-hidden rounded-md border border-border/40 h-14 w-14 bg-muted">
              {event.cover_image_url ? (
                <Image 
                  src={event.cover_image_url} 
                  alt={event.name}
                  fill
                  className="object-cover transition-transform hover:scale-110"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center"
                     style={{
                      backgroundColor: 
                        event.status === 'published' ? 'var(--green-500)' : 
                        event.status === 'draft' ? 'var(--amber-500)' : 
                        event.status === 'completed' ? 'var(--blue-500)' : 
                        event.status === 'cancelled' ? 'var(--destructive)' : 
                        'var(--primary)',
                     }}>
                  <span className="text-sm font-semibold text-white">
                    {getInitials(event.name)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Event details with improved layout */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h4 className="text-base font-medium truncate">
                    {event.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {formatDate(event.date)}
                    </span>
                    
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[150px]">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Status badge with improved styling */}
                {event.status && (
                  <EventStatusBadge status={event.status} />
                )}
              </div>
              
              {/* Attendance and photo stats with improved layout */}
              {(event.attendeeCount !== undefined || event.photoCount !== undefined) && (
                <div className="flex gap-3 mt-2">
                  {event.attendeeCount !== undefined && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      <Users className="mr-1 h-3 w-3 text-muted-foreground" />
                      {event.attendeeCount} attendees
                    </span>
                  )}
                  {event.photoCount !== undefined && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      <ImageIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                      {event.photoCount} photos
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Arrow indicator */}
            <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground/70" />
          </div>
        </Link>
      ))}
    </div>
  )
}

function EventStatusBadge({ status }: { status: string }) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
      case 'active':
      case 'live':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'draft':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case 'completed':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'cancelled':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const baseClass = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ";
  const statusClass = getStatusStyles(status);
  
  return <span className={baseClass + statusClass}>{status}</span>;
} 