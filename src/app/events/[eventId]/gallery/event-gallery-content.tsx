"use client"

import { useState } from 'react'
import { Media } from '@/types/media'
import { MediaGrid } from '@/components/gallery/MediaGrid'
import { useMediaStore } from '@/store/media-store'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface EventGalleryContentProps {
  media: Media[]
  eventId: string
  userId: string
}

/**
 * Client-side component for displaying the media gallery
 */
export function EventGalleryContent({
  media,
  eventId,
  userId
}: EventGalleryContentProps) {
  const { fetchEventMedia, eventMedia } = useMediaStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mediaItems, setMediaItems] = useState<Media[]>(media)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchEventMedia(eventId)
      setMediaItems(eventMedia)
    } catch (error) {
      console.error('Error refreshing media:', error)
    } finally {
      setIsRefreshing(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Media</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <MediaGrid
        mediaItems={mediaItems}
        isLoading={isRefreshing}
        emptyMessage="No media found for this event"
        showEventName={false}
        filterByMediaType={true}
      />
    </div>
  )
} 