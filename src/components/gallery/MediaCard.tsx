"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Film, Image as ImageIcon, Heart, ThumbsUp, ThumbsDown, MoreVertical, Tag, Clock, Eye, Play, CheckCircle, XCircle, User, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Media, MediaStatus, MediaType } from '@/types/media'
import { useMediaStore } from '@/store/media-store'
import { cn } from '@/lib/utils'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface MediaCardProps {
  media: Media
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape'
  width?: number
  height?: number
  priority?: boolean
  showUser?: boolean
  showDate?: boolean
  showEvent?: boolean
  showApproval?: boolean
  showControls?: boolean
  onApprove?: (media: Media) => void
  onReject?: (media: Media) => void
  onClick?: () => void
  className?: string
}

/**
 * MediaCard component for displaying photo or video items in the gallery
 */
export function MediaCard({
  media,
  aspectRatio = 'square',
  width = 300,
  height = 300,
  priority = false,
  showUser = false,
  showDate = true,
  showEvent = false,
  showApproval = false,
  showControls = false,
  onApprove,
  onReject,
  onClick,
  className
}: MediaCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  
  // Get actions from store
  const { approveMedia, rejectMedia, removeMedia } = useMediaStore()
  
  // Get aspect ratio based on media type and specified ratio
  const getAspectRatio = () => {
    if (aspectRatio === 'video') return 16 / 9
    if (aspectRatio === 'portrait') return 3 / 4
    if (aspectRatio === 'landscape') return 4 / 3
    return 1 // square
  }
  
  const isVideo = media.media_type === 'video'
  
  // Format date
  const formattedDate = media.created_at 
    ? formatDistanceToNow(new Date(media.created_at), { addSuffix: true })
    : ''
  
  // Handle image load complete
  const handleImageLoadComplete = () => {
    setIsImageLoading(false)
  }
  
  // Handle approve button click
  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onApprove) {
      onApprove(media)
    } else {
      await approveMedia(media.id)
    }
  }
  
  // Handle reject button click
  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReject) {
      onReject(media)
    } else {
      await rejectMedia(media.id)
    }
  }
  
  // Handle delete button click
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = window.confirm('Are you sure you want to delete this item?')
    if (confirmed) {
      await removeMedia(media.id)
    }
  }
  
  // Get status badge
  const getStatusBadge = () => {
    if (!showApproval) return null
    
    switch (media.status) {
      case MediaStatus.APPROVED:
        return (
          <Badge variant="success" className="absolute top-2 right-2 z-10">
            Approved
          </Badge>
        )
      case MediaStatus.REJECTED:
        return (
          <Badge variant="destructive" className="absolute top-2 right-2 z-10">
            Rejected
          </Badge>
        )
      case MediaStatus.PENDING:
        return (
          <Badge variant="outline" className="absolute top-2 right-2 z-10 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-500 border-orange-200 dark:border-orange-800">
            Pending
          </Badge>
        )
      default:
        return null
    }
  }
  
  // Get aspect ratio class based on prop
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      case 'landscape':
        return 'aspect-[4/3]'
      default:
        return 'aspect-square'
    }
  }
  
  return (
    <Card 
      className={cn(
        "overflow-hidden group transition-all duration-200 hover:shadow-md",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className={cn(
          "relative w-full overflow-hidden", 
          getAspectRatioClass()
        )}>
          {/* Skeleton while loading */}
          {isImageLoading && (
            <Skeleton className="absolute inset-0 z-0" />
          )}
          
          {/* Media thumbnail */}
          {isVideo ? (
            <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {media.thumbnail_url ? (
                <Image
                  src={media.thumbnail_url}
                  alt={media.filename}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoadingComplete={handleImageLoadComplete}
                  priority={priority}
                />
              ) : (
                <Film className="w-12 h-12 text-gray-400" />
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {media.duration ? `${Math.floor(media.duration / 60)}:${(media.duration % 60).toString().padStart(2, '0')}` : '0:00'}
              </div>
            </div>
          ) : (
            <Image
              src={media.url || '/images/placeholder-image.jpg'}
              alt={media.filename}
              fill
              className={cn(
                "object-cover transition-opacity duration-300 group-hover:scale-105 transition-transform",
                isImageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoadingComplete={handleImageLoadComplete}
              priority={priority}
            />
          )}
          
          {/* Approval status indicator */}
          {getStatusBadge()}
          
          {/* Media type indicator */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-black/50 text-white border-none">
              {media.media_type === MediaType.VIDEO ? (
                <Film className="w-3 h-3 mr-1" />
              ) : (
                <ImageIcon className="w-3 h-3 mr-1" />
              )}
              {media.media_type === MediaType.VIDEO ? 'Video' : 'Photo'}
            </Badge>
          </div>
          
          {/* Tags indicator */}
          {media.metadata?.tags?.length > 0 && (
            <div className="absolute top-2 right-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-black/50 text-white border-none">
                    <Tag className="w-3 h-3 mr-1" />
                    {media.metadata.tags.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    {media.metadata.tags.join(', ')}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {/* Hover overlay with actions */}
          {showControls && isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {showApproval && media.status === MediaStatus.PENDING && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {showApproval && media.status === MediaStatus.APPROVED && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
              
              {showApproval && media.status === MediaStatus.REJECTED && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/20 border-white/50 text-white hover:bg-white hover:text-black"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => window.open(media.url, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Size
                  </DropdownMenuItem>
                  {showEvent && media.event && (
                    <DropdownMenuItem asChild>
                      <Link href={`/events/${media.event_id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Event
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => {
                    const url = media.url || '';
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = media.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                    <Eye className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start p-3 space-y-1">
        <div className="w-full flex justify-between items-start">
          <h3 className="text-sm font-medium truncate flex-1" title={media.filename}>
            {media.filename}
          </h3>
        </div>
        
        <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
          {showEvent && media.event && (
            <Link href={`/events/${media.event_id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
              {media.event.name}
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 