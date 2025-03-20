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
      icon: <QrCode className="h-4 w-4" />,
      href: "/protected/attendees/qr-codes",
    },
    {
      title: "Invite Attendees",
      description: "Send invitations to guests",
      icon: <UserPlus className="h-4 w-4" />,
      href: "/protected/attendees/manage",
    },
    {
      title: "Moderate Photos",
      description: "Review and approve photos",
      icon: <Camera className="h-4 w-4" />,
      href: "/protected/gallery/moderate",
    },
    {
      title: "View Analytics",
      description: "Check event performance",
      icon: <BarChart className="h-4 w-4" />,
      href: "/protected/analytics/events",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto w-full justify-start space-x-4 px-4 py-3"
              asChild
            >
              <Link href={action.href}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {action.icon}
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">
                    {action.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 