"use client"

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ThumbsUp, 
  ThumbsDown,
  Film,
  Tag,
  Info,
  Clock,
  User,
  Eye
} from 'lucide-react'

import { Media } from '@/types/media'
import { useMediaStore } from '@/store/media-store'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MediaLightboxProps {
  media: Media
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  showApproval?: boolean
}

/**
 * MediaLightbox component for displaying a media item in a full-screen lightbox
 */
export function MediaLightbox({
  media,
  onClose,
  onNext,
  onPrevious,
  showApproval = false
}: MediaLightboxProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  
  // Get actions from store
  const { approveMedia, rejectMedia } = useMediaStore()
  
  // Determine if it's a video
  const isVideo = media.media_type === 'video'
  
  // Format date
  const formattedDate = format(new Date(media.created_at), 'PPpp')
  
  // Handle image load complete
  const handleImageLoadComplete = () => {
    setIsImageLoading(false)
  }
  
  // Handle approve button click
  const handleApprove = async () => {
    await approveMedia(media.id)
  }
  
  // Handle reject button click
  const handleReject = async () => {
    await rejectMedia(media.id)
  }
  
  // Handle download button click
  const handleDownload = () => {
    const url = media.url || ''
    const link = document.createElement('a')
    link.href = url
    link.download = media.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="absolute inset-0 z-50 flex flex-col">
        {/* Header */}
        <div className="relative px-4 py-3 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold truncate max-w-[calc(100vw-180px)]">
            {media.filename}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>
            {showApproval && (
              <>
                <Button
                  variant={media.is_approved ? "default" : "outline"}
                  size="icon"
                  title="Approve"
                  onClick={handleApprove}
                >
                  <ThumbsUp className="h-5 w-5" />
                </Button>
                <Button
                  variant={!media.is_approved ? "destructive" : "outline"}
                  size="icon"
                  title="Reject"
                  onClick={handleReject}
                >
                  <ThumbsDown className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with metadata */}
          {showInfo && (
            <div className="w-80 border-r bg-background overflow-hidden transition-all">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <dt className="w-24 flex-shrink-0 text-muted-foreground">Media Type</dt>
                        <dd className="flex-1">
                          <Badge variant="outline" className="font-normal">
                            {isVideo ? (
                              <Film className="w-3 h-3 mr-1" />
                            ) : (
                              <Eye className="w-3 h-3 mr-1" />
                            )}
                            {media.media_type === 'video' ? 'Video' : 'Photo'}
                          </Badge>
                        </dd>
                      </div>
                      {isVideo && media.duration && (
                        <div className="flex items-start">
                          <dt className="w-24 flex-shrink-0 text-muted-foreground">Duration</dt>
                          <dd className="flex-1">
                            {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                          </dd>
                        </div>
                      )}
                      {media.width && media.height && (
                        <div className="flex items-start">
                          <dt className="w-24 flex-shrink-0 text-muted-foreground">Dimensions</dt>
                          <dd className="flex-1">
                            {media.width} × {media.height}
                          </dd>
                        </div>
                      )}
                      {media.size && (
                        <div className="flex items-start">
                          <dt className="w-24 flex-shrink-0 text-muted-foreground">File Size</dt>
                          <dd className="flex-1">
                            {Math.round(media.size / 1024)} KB
                          </dd>
                        </div>
                      )}
                      <div className="flex items-start">
                        <dt className="w-24 flex-shrink-0 text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Uploaded
                        </dt>
                        <dd className="flex-1">{formattedDate}</dd>
                      </div>
                      <div className="flex items-start">
                        <dt className="w-24 flex-shrink-0 text-muted-foreground">Status</dt>
                        <dd className="flex-1">
                          <Badge variant={media.is_approved ? "success" : "warning"}>
                            {media.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  {media.metadata?.tags && media.metadata.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {media.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {media.metadata?.caption && (
                    <div>
                      <h3 className="font-medium mb-2">Caption</h3>
                      <p className="text-sm text-muted-foreground">
                        {media.metadata.caption}
                      </p>
                    </div>
                  )}
                  
                  {media.metadata?.location && (
                    <div>
                      <h3 className="font-medium mb-2">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        {media.metadata.location.name || 
                          (media.metadata.location.latitude && media.metadata.location.longitude
                            ? `${media.metadata.location.latitude}, ${media.metadata.location.longitude}`
                            : 'Location data available')}
                      </p>
                    </div>
                  )}
                  
                  {media.metadata?.camera && (
                    <div>
                      <h3 className="font-medium mb-2">Camera</h3>
                      <p className="text-sm text-muted-foreground">
                        {[
                          media.metadata.camera.make,
                          media.metadata.camera.model
                        ].filter(Boolean).join(' ')}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Media display */}
          <div className="flex-1 relative overflow-hidden">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-64 w-64 rounded-md" />
              </div>
            )}
            
            {isVideo ? (
              <div className="h-full w-full flex items-center justify-center bg-black">
                <video
                  src={media.url}
                  controls
                  className="max-h-full max-w-full object-contain"
                  autoPlay
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-black">
                <Image
                  src={media.url || '/images/placeholder-image.jpg'}
                  alt={media.filename}
                  fill
                  className="object-contain"
                  onLoadingComplete={handleImageLoadComplete}
                  priority
                />
              </div>
            )}
            
            {/* Navigation buttons */}
            {onPrevious && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            
            {onNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 