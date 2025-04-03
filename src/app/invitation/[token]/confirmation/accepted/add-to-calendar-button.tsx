"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { CalendarPlus } from 'lucide-react'

interface CalendarEvent {
  name: string
  details: string
  location: string
  startsAt: string
  endsAt: string
}

interface AddToCalendarButtonProps {
  event: CalendarEvent
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false)
  
  // Generate Google Calendar URL
  const googleCalendarUrl = () => {
    const baseUrl = 'https://calendar.google.com/calendar/render'
    
    const details = encodeURIComponent(event.details)
    const location = encodeURIComponent(event.location)
    const text = encodeURIComponent(event.name)
    const dates = `${new Date(event.startsAt).toISOString().replace(/-|:|\.\d+/g, '')}/${new Date(event.endsAt).toISOString().replace(/-|:|\.\d+/g, '')}`
    
    return `${baseUrl}?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`
  }
  
  // Generate iCal/Outlook URL (download .ics file)
  const generateIcsFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${event.name}`,
      `DTSTART:${new Date(event.startsAt).toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTEND:${new Date(event.endsAt).toISOString().replace(/-|:|\.\d+/g, '')}`,
      `LOCATION:${event.location}`,
      `DESCRIPTION:${event.details}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n')
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.name.replace(/\s+/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Generate Yahoo Calendar URL
  const yahooCalendarUrl = () => {
    const baseUrl = 'https://calendar.yahoo.com/'
    
    const title = encodeURIComponent(event.name)
    const desc = encodeURIComponent(event.details)
    const loc = encodeURIComponent(event.location)
    const st = new Date(event.startsAt).toISOString().replace(/-|:|\.\d+/g, '')
    const et = new Date(event.endsAt).toISOString().replace(/-|:|\.\d+/g, '')
    
    return `${baseUrl}?v=60&title=${title}&st=${st}&et=${et}&desc=${desc}&in_loc=${loc}`
  }
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => window.open(googleCalendarUrl(), '_blank')}>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateIcsFile}>
          Outlook / iCal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(yahooCalendarUrl(), '_blank')}>
          Yahoo Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 