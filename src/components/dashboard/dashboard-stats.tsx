import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ImageIcon, Users, Clock } from "lucide-react"

interface DashboardStatsProps {
  totalEvents: number
  totalAttendees: number
  totalPhotos: number
  activeEvents: number
}

export function DashboardStats({
  totalEvents,
  totalAttendees,
  totalPhotos,
  activeEvents,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Events",
      value: totalEvents,
      icon: <Calendar className="h-4 w-4" />,
      description: "Events created",
    },
    {
      title: "Total Attendees",
      value: totalAttendees,
      icon: <Users className="h-4 w-4" />,
      description: "Event participants",
    },
    {
      title: "Active Events",
      value: activeEvents,
      icon: <Clock className="h-4 w-4" />,
      description: "Currently running",
    },
    {
      title: "Total Photos",
      value: totalPhotos,
      icon: <ImageIcon className="h-4 w-4" />,
      description: "Photos uploaded",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                {stat.icon}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {stat.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 