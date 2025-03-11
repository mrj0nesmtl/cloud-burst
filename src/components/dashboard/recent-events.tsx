import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { EyeIcon, Edit, Users } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  attendeeCount: number
  photoCount: number
}

interface RecentEventsProps {
  events: Event[]
}

export function RecentEvents({ events }: RecentEventsProps) {
  if (!events || events.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              You haven't created any events yet.
            </p>
            <Button asChild>
              <Link href="/protected/events/create">Create Your First Event</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <h4 className="font-semibold">{event.name}</h4>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <p>{formatDate(event.date)}</p>
                  <p className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.attendeeCount} Attendees
                  </p>
                  <p>{event.photoCount} Photos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/protected/events/${event.id}`}>
                    <EyeIcon className="mr-1 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/protected/events/${event.id}/edit`}>
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/protected/events/${event.id}/attendees`}>
                    <Users className="mr-1 h-4 w-4" />
                    Manage
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 