'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  Upload, 
  Mail, 
  QrCode
} from "lucide-react"

interface EventNavigationProps {
  eventId: string
}

export default function EventNavigation({ eventId }: EventNavigationProps) {
  const pathname = usePathname()
  
  const links = [
    {
      href: `/events/${eventId}/dashboard`,
      label: "Dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: `/events/${eventId}/gallery`,
      label: "Gallery",
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      href: `/events/${eventId}/upload`,
      label: "Upload",
      icon: <Upload className="h-4 w-4" />,
    },
    {
      href: `/events/${eventId}/invitations`,
      label: "Invitations",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      href: `/events/${eventId}/qr-scan`,
      label: "QR Scanner",
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      href: `/events/${eventId}/guests`,
      label: "Guests",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: `/events/${eventId}/settings`,
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]
  
  return (
    <nav className="flex items-center space-x-1 lg:space-x-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex h-8 items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted hover:text-foreground"
          )}
        >
          {link.icon}
          <span className="ml-2 hidden md:inline-block">{link.label}</span>
        </Link>
      ))}
    </nav>
  )
} 