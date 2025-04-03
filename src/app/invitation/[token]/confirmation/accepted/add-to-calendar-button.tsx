'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type CalendarEvent = {
  name: string
  details: string
  location: string
  startsAt: string
  endsAt: string
}

export function AddToCalendarButton({ event }: { event: CalendarEvent }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Google Calendar URL
  const googleCalendarUrl = () => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    const dates = `&dates=${formatDateForGoogle(event.startsAt)}/${formatDateForGoogle(event.endsAt)}`
    const details = `&text=${encodeURIComponent(event.name)}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`
    
    return `${base}${dates}${details}`
  }
  
  // iCalendar file download
  const generateICalContent = () => {
    const formatICalDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toISOString().replace(/-|:|\.\d+/g, '')
    }
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cloud Burst//Event//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${event.name}
DTSTART:${formatICalDate(event.startsAt)}
DTEND:${formatICalDate(event.endsAt)}
LOCATION:${event.location}
DESCRIPTION:${event.details}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`
  }
  
  const downloadICalFile = () => {
    const content = generateICalContent()
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/calendar' })
    element.href = URL.createObjectURL(file)
    element.download = `${event.name.replace(/\s+/g, '-')}.ics`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
  
  // Format date for Google Calendar
  const formatDateForGoogle = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().replace(/-|:|\.\d+/g, '')
  }
  
  // Outlook.com calendar URL
  const outlookCalendarUrl = () => {
    const base = 'https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent'
    const subject = `&subject=${encodeURIComponent(event.name)}`
    const startDate = `&startdt=${event.startsAt}`
    const endDate = `&enddt=${event.endsAt}`
    const body = `&body=${encodeURIComponent(event.details)}`
    const location = `&location=${encodeURIComponent(event.location)}`
    
    return `${base}${subject}${startDate}${endDate}${body}${location}`
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => window.open(googleCalendarUrl(), '_blank')}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadICalFile}>
          Apple Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(outlookCalendarUrl(), '_blank')}>
          Outlook Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 