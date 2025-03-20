import { Calendar, Image, Users } from "lucide-react";

interface StatsProps {
  totalEvents: number;
  totalAttendees: number;
  totalPhotos: number;
  activeEvents: number;
}

export function DashboardStats({
  totalEvents,
  totalAttendees,
  totalPhotos,
  activeEvents,
}: StatsProps) {
  const stats = [
    {
      title: "Total Events",
      value: totalEvents,
      icon: Calendar,
      description: "Total events created",
    },
    {
      title: "Total Attendees",
      value: totalAttendees,
      icon: Users,
      description: "Total event attendees",
    },
    {
      title: "Total Photos",
      value: totalPhotos,
      icon: Image,
      description: "Photos uploaded",
    },
    {
      title: "Active Events",
      value: activeEvents,
      icon: Calendar,
      description: "Currently active events",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="group rounded-lg border bg-card transition-all hover:shadow-md"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className="mt-4">
              <h3 className="font-medium text-foreground">
                {stat.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
} 