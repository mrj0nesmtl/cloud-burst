"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Film, Image as ImageIcon, Heart, ThumbsUp, ThumbsDown, MoreVertical, Tag, Clock, Eye, Play, CheckCircle, XCircle, User, Calendar, MoreHorizontal, Pencil, Send } from 'lucide-react'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Download, Share } from "lucide-react"

export interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title?: string;
  description?: string;
  media_type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string;
  created_at: string;
  width?: number;
  height?: number;
  duration?: number;
  uploaded_by?: string;
  is_approved?: boolean;
  comments?: Comment[];
  status?: MediaStatus;
  metadata?: {
    tags?: string[];
  };
  event?: {
    id: string;
    name: string;
  };
  event_id?: string;
}

interface MediaCardProps {
  item: MediaItem;
  onClick?: (item: MediaItem) => void;
  showComments?: boolean;
  isPublic?: boolean;
  aspectRatio?: number | 'square' | 'video' | 'portrait' | 'landscape';
  onAddComment?: (mediaId: string, comment: string) => void;
  onLike?: (mediaId: string) => void;
  className?: string;
  priority?: boolean;
  showControls?: boolean;
  showApproval?: boolean;
  showEvent?: boolean;
  onApprove?: (item: MediaItem) => void;
  onReject?: (item: MediaItem) => void;
}

/**
 * MediaCard component for displaying photo or video items in the gallery
 */
export function MediaCard({
  item,
  onClick,
  showComments = false,
  isPublic = false,
  aspectRatio = 4/3,
  onAddComment,
  onLike,
  className = "",
  priority = false,
  showControls = false,
  showApproval = false,
  showEvent = false,
  onApprove,
  onReject
}: MediaCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  
  // Get actions from store - we'll use empty functions if not available
  const mediaStore = useMediaStore()
  const approveMedia = mediaStore.approveMediaItem || ((id: string) => Promise.resolve(null))
  const rejectMedia = mediaStore.rejectMediaItem || ((id: string) => Promise.resolve(null))
  const removeMedia = mediaStore.deleteMediaItem || ((id: string) => Promise.resolve(false))
  
  // Get aspect ratio based on media type and specified ratio
  const getAspectRatio = () => {
    if (aspectRatio === 'video') return 16 / 9
    if (aspectRatio === 'portrait') return 3 / 4
    if (aspectRatio === 'landscape') return 4 / 3
    if (aspectRatio === 'square') return 1
    if (typeof aspectRatio === 'number') return aspectRatio
    return 1 // default to square
  }
  
  const isVideo = item.media_type === 'video'
  
  // Format date
  const formattedDate = item.created_at 
    ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
    : ''
  
  // Custom formatDate function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }
  
  // Handle image load complete
  const handleImageLoadComplete = () => {
    setIsImageLoading(false)
  }
  
  // Handle approve button click
  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onApprove) {
      onApprove(item)
    } else {
      await approveMedia(item.id)
    }
  }
  
  // Handle reject button click
  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReject) {
      onReject(item)
    } else {
      await rejectMedia(item.id)
    }
  }
  
  // Handle delete button click
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = window.confirm('Are you sure you want to delete this item?')
    if (confirmed) {
      await removeMedia(item.id)
    }
  }
  
  // Get status badge
  const getStatusBadge = () => {
    if (!showApproval) return null
    
    switch (item.status) {
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
  
  const handleClick = () => {
    if (onClick) {
      onClick(item)
    }
  }
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    if (onLike) {
      onLike(item.id)
    }
  }
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (newComment.trim() && onAddComment) {
      onAddComment(item.id, newComment)
      setNewComment("")
    }
  }
  
  return (
    <Card 
      className={cn(
        "overflow-hidden group transition-all duration-200 hover:shadow-md w-full max-w-full",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative">
          {getStatusBadge()}
          
          {isVideo ? (
            // Video thumbnail with play button
            <div className="relative">
              <div className={cn(getAspectRatioClass(), "bg-muted/30 overflow-hidden")}>
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title || "Video thumbnail"}
                    fill
                    className="object-cover"
                    onLoadingComplete={handleImageLoadComplete}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    priority={priority}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-muted">
                    <Film className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/50 p-3">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Duration badge */}
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Image display
            <div className={cn(getAspectRatioClass(), "bg-muted/30 overflow-hidden")}>
              <Image
                src={item.url}
                alt={item.title || "Media image"}
                fill
                className="object-cover"
                onLoadingComplete={handleImageLoadComplete}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                priority={priority}
              />
            </div>
          )}
          
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Skeleton className={cn(getAspectRatioClass(), "w-full h-full")} />
            </div>
          )}
        </div>
        
        <div className="p-3">
          <div className="flex justify-between items-start mb-1 gap-2">
            <div className="flex-1 min-w-0"> {/* Added min-width to prevent text from expanding container */}
              <h3 className="font-medium text-sm truncate">
                {item.title || "Untitled"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formattedDate}</span>
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                {!isPublic && (
                  <>
                    <DropdownMenuItem className="cursor-pointer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={handleDelete}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Show event name if present and enabled */}
          {showEvent && item.event && (
            <div className="mt-1 mb-2">
              <Badge variant="outline" className="text-xs">
                {item.event.name}
              </Badge>
            </div>
          )}
          
          {/* Conditional approval buttons */}
          {showApproval && item.status === MediaStatus.PENDING && (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8"
                onClick={handleApprove}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      {showComments && (
        <Collapsible 
          open={isExpanded} 
          onOpenChange={setIsExpanded}
          className="border-t"
        >
          <CollapsibleTrigger asChild className="w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex justify-between p-3 h-auto rounded-none text-muted-foreground"
            >
              <span>
                Comments ({item.comments?.length || 0})
              </span>
              <span className="text-xs">
                {isExpanded ? 'Hide' : 'Show'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t px-3 py-2 max-h-[300px] overflow-y-auto space-y-3">
            {/* Comments list */}
            {item.comments && item.comments.length > 0 ? (
              item.comments.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    {comment.author.avatarUrl && (
                      <AvatarImage src={comment.author.avatarUrl} />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {comment.author.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-xs truncate">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-2">
                No comments yet.
              </div>
            )}
            
            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2 items-center">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="h-8 text-xs flex-1 max-w-full"
                onClick={(e) => e.stopPropagation()}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8"
                disabled={!newComment.trim()}
                onClick={(e) => e.stopPropagation()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      <CardFooter className="p-3 pt-0 gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8",
            isLiked && "text-red-500"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>
        
        {/* Quick controls */}
        {showControls && !isPublic && (
          <div className="flex justify-end flex-1 gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 