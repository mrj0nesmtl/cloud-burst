import { ReactNode } from "react"

interface EventsLayoutProps {
  children: ReactNode
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  return (
    <div className="container mx-auto py-6">
      {children}
    </div>
  )
}

export const metadata = {
  title: "Events | Cloud Burst",
  description: "Manage your photography events",
} 