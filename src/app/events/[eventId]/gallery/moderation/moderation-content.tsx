"use client"

import { useEffect } from 'react'
import { MediaModeration } from '@/components/gallery/MediaModeration'
import { useMediaStore } from '@/store/media-store'

interface ModerationContentProps {
  eventId: string
  userId: string
  isOrganizer: boolean
}

/**
 * Client-side component for the moderation page
 */
export default function ModerationContent({
  eventId,
  userId,
  isOrganizer
}: ModerationContentProps) {
  const { fetchEventPendingMedia } = useMediaStore()
  
  // Load pending media on component mount
  useEffect(() => {
    if (isOrganizer) {
      fetchEventPendingMedia(eventId)
    }
  }, [eventId, isOrganizer, fetchEventPendingMedia])
  
  return (
    <MediaModeration
      eventId={eventId}
      userId={userId}
      isOrganizer={isOrganizer}
    />
  )
} 