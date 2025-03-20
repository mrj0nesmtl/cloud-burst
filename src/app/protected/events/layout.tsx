import { ReactNode } from "react"

interface EventsLayoutProps {
  children: React.ReactNode
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      {children}
    </div>
  )
}

export const metadata = {
  title: "Events | Cloud Burst",
  description: "Manage your photography events",
} 