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
  const { fetchPendingEventMedia } = useMediaStore()
  
  // Load pending media on component mount
  useEffect(() => {
    if (isOrganizer) {
      fetchPendingEventMedia(eventId)
    }
  }, [eventId, isOrganizer, fetchPendingEventMedia])
  
  return (
    <MediaModeration
      eventId={eventId}
      userId={userId}
      isOrganizer={isOrganizer}
    />
  )
} 