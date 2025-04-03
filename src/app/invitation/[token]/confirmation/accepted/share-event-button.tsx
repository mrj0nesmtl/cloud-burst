'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Mail, MessageSquare } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type EventShareData = {
  name: string
  date: string
  location: string
  url: string
}

export function ShareEventButton({ event }: { event: EventShareData }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const shareMessage = `I'm attending ${event.name} on ${event.date}${event.location ? ` at ${event.location}` : ''}. Join me!`
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareMessage} ${event.url}`).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: 'Event details copied to clipboard',
      })
      setIsOpen(false)
    })
  }
  
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join me at ${event.name}`)
    const body = encodeURIComponent(`${shareMessage}\n\nRSVP here: ${event.url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    setIsOpen(false)
  }
  
  const shareViaSMS = () => {
    const text = encodeURIComponent(`${shareMessage} ${event.url}`)
    window.open(`sms:?body=${text}`, '_blank')
    setIsOpen(false)
  }
  
  // Use Web Share API if available
  const shareNative = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator.share({
        title: `Join me at ${event.name}`,
        text: shareMessage,
        url: event.url,
      })
        .then(() => setIsOpen(false))
        .catch((error) => console.error('Error sharing:', error))
    } else {
      // Fallback to dropdown menu
      setIsOpen(true)
    }
  }
  
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator
  
  return (
    <>
      {hasNativeShare ? (
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={shareNative}
        >
          <Share2 className="h-4 w-4" />
          Share Event
        </Button>
      ) : (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Event
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareViaEmail} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareViaSMS} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Text Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
} 