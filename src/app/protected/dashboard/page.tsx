import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, Image, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Your event management dashboard',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardPage() {
  // Normally we would fetch data here, but for simplicity let's use mock data
  const eventCount = 1;
  const attendeeCount = 0;
  const photoCount = 0;
  const upcomingCount = 0;
  
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      {/* Page header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Welcome to your event management dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/protected/events/create">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <div className="rounded-full bg-primary/10 p-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventCount}</div>
            <p className="text-xs text-muted-foreground">
              {eventCount} active, 0 drafts
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendees</CardTitle>
            <div className="rounded-full bg-primary/10 p-1.5">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendeeCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photos</CardTitle>
            <div className="rounded-full bg-primary/10 p-1.5">
              <Image className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photoCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <div className="rounded-full bg-primary/10 p-1.5">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              In the next 7 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity and Events Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-4">No recent events found.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-4">No recent activity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 