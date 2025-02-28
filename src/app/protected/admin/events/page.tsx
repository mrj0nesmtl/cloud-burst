import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server-config'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

async function EventList() {
  const supabase = createClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })

  if (!events?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.name}</TableCell>
            <TableCell>{format(new Date(event.date), 'PPP')}</TableCell>
            <TableCell>{event.profiles?.username}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                event.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {event.status}
              </span>
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                asChild
              >
                <a href={`/protected/admin/events/${event.id}`}>
                  Edit
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>
            View and manage events across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <Input placeholder="Search events..." type="search" />
            </div>
            <Button>Create Event</Button>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <EventList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 