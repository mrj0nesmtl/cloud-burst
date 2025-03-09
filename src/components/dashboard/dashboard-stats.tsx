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
      title: "Events",
      value: totalEvents,
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Attendees",
      value: totalAttendees,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Active Events",
      value: activeEvents,
      icon: <Clock className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Photos",
      value: totalPhotos,
      icon: <ImageIcon className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
              <div className="rounded-full bg-muted p-2">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 