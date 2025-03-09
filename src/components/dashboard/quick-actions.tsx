import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { QrCode, UserPlus, Camera, BarChart } from "lucide-react"

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: "Generate QR Codes",
      description: "Create check-in codes for events",
      icon: <QrCode className="h-5 w-5" />,
      href: "/protected/attendees/qr-codes",
    },
    {
      title: "Invite Attendees",
      description: "Send invitations to guests",
      icon: <UserPlus className="h-5 w-5" />,
      href: "/protected/attendees/manage",
    },
    {
      title: "Moderate Photos",
      description: "Review and approve photos",
      icon: <Camera className="h-5 w-5" />,
      href: "/protected/gallery/moderate",
    },
    {
      title: "View Analytics",
      description: "Check event performance",
      icon: <BarChart className="h-5 w-5" />,
      href: "/protected/analytics/events",
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid gap-4 max-w-full">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="justify-start h-auto p-4 overflow-hidden"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="rounded-full p-2 bg-muted shrink-0">
                    {action.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-medium truncate">{action.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 