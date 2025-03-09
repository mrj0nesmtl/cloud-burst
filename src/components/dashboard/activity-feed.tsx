import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Image, MessageSquare, UserPlus, BellRing } from "lucide-react"

interface Activity {
  id: string
  type: 'photo' | 'comment' | 'rsvp' | 'system'
  content: string
  eventId?: string
  eventName?: string
  timestamp: string
  meta?: {
    [key: string]: any
  }
}

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity
          </p>
        </CardContent>
      </Card>
    )
  }

  // Function to get the appropriate icon for each activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'photo':
        return <Image className="h-4 w-4" />
      case 'comment':
        return <MessageSquare className="h-4 w-4" />
      case 'rsvp':
        return <UserPlus className="h-4 w-4" />
      case 'system':
        return <BellRing className="h-4 w-4" />
      default:
        return <BellRing className="h-4 w-4" />
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-4 max-w-full">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm font-medium break-words">
                  {activity.content}
                  {activity.eventName && (
                    <span className="font-normal text-muted-foreground">
                      {" "}on{" "}
                      <Link 
                        href={`/protected/events/${activity.eventId}`}
                        className="text-primary hover:underline"
                      >
                        {activity.eventName}
                      </Link>
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full text-sm">
          View All Activity
        </Button>
      </CardFooter>
    </Card>
  )
} 