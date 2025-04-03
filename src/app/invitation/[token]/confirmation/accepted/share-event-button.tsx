"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface EventShareInfo {
  name: string
  date: string
  location: string
  url: string
}

interface ShareEventButtonProps {
  event: EventShareInfo
}

export function ShareEventButton({ event }: ShareEventButtonProps) {
  const [open, setOpen] = useState(false)

  // Generate the message to share
  const shareMessage = `Join me at ${event.name} on ${event.date}${event.location ? ` at ${event.location}` : ''}! RSVP here: ${event.url}`

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage)
      .then(() => {
        toast.success('Copied to clipboard')
        setOpen(false)
      })
      .catch(() => {
        toast.error('Failed to copy')
      })
  }

  // Share via email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Invitation to ${event.name}`)
    const body = encodeURIComponent(shareMessage)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    setOpen(false)
  }

  // Share via SMS
  const shareViaSms = () => {
    window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank')
    setOpen(false)
  }

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank')
    setOpen(false)
  }

  // Share via Twitter/X
  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, '_blank')
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Share Event
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={copyToClipboard}>
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail}>
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaSms}>
          SMS
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaWhatsApp}>
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaTwitter}>
          Twitter/X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 