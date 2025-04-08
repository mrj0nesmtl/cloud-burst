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
        "overflow-hidden group transition-all duration-200 hover:shadow-md w-full max-w-full scale-90 transform origin-top",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className={cn(
          "relative overflow-hidden",
          getAspectRatioClass()
        )}>
          {/* Use maxHeight to constrain image size */}
          <div style={{ 
            maxHeight: "375px",
            position: "relative", 
            width: "100%", 
            height: "100%"
          }}>
            {getStatusBadge()}
            
            {isVideo ? (
              // Video handling with thumbnail
              <>
                <Image
                  src={item.thumbnail_url || item.url}
                  alt={item.title || "Video thumbnail"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={priority}
                  className={cn(
                    "transition-all duration-200",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={handleImageLoadComplete}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-1.5">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </>
            ) : (
              // Image handling
              <Image
                src={item.url}
                alt={item.title || "Gallery image"}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                className={cn(
                  "transition-all duration-200",
                  isImageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={handleImageLoadComplete}
              />
            )}
            
            {/* Loading skeleton */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Skeleton className="h-[80%] w-[80%] rounded-md" />
              </div>
            )}
            
            {/* Overlay with controls */}
            <div className={cn(
              "absolute inset-0 bg-black/0 transition-all duration-200 flex items-center justify-center",
              isHovered ? "bg-black/30" : "bg-black/0 opacity-0"
            )}>
              {/* Hover overlay content */}
            </div>
          </div>
        </div>
        
        {/* Card footer with details */}
        <div className="p-2 space-y-1">
          {item.title && (
            <div className="flex justify-between items-start gap-1">
              <h3 className="font-semibold text-xs truncate">
                {item.title}
              </h3>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isPublic && (
                    <>
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {showApproval && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleReject}>
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isPublic && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleDelete}
                        className="text-red-500 focus:text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Date and metadata */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
          
          {/* Tags */}
          {item.metadata?.tags && item.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.metadata.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs py-0 px-1.5">
                  {tag}
                </Badge>
              ))}
              {item.metadata.tags.length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-1.5">
                  +{item.metadata.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Event link if applicable */}
          {showEvent && item.event && (
            <div className="text-xs flex items-center mt-1.5">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <Link 
                href={`/protected/events/${item.event.id}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {item.event.name}
              </Link>
            </div>
          )}
          
          {/* Actions bar */}
          <div className="flex items-center justify-between pt-1 mt-1 border-t text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-6 px-1 text-xs", isLiked && "text-red-500")}
              onClick={handleLike}
            >
              <Heart className={cn("h-3 w-3 mr-1", isLiked && "fill-current")} />
              Like
            </Button>
            
            {showComments && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {(item.comments?.length || 0) > 0 && (
                  <span className="mr-1 text-xs">{item.comments?.length}</span>
                )}
                Comments
              </Button>
            )}
          </div>
          
          {/* Comments section */}
          {showComments && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-1.5">
              <CollapsibleContent className="space-y-2">
                {/* Existing comments */}
                {item.comments && item.comments.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {item.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          {comment.author.avatarUrl ? (
                            <AvatarImage src={comment.author.avatarUrl} />
                          ) : null}
                          <AvatarFallback>{comment.author.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">{comment.author.name}</span>
                            <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                          </div>
                          <p className="text-xs">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-center text-muted-foreground py-1.5">
                    No comments yet
                  </div>
                )}
                
                {/* Add comment form */}
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1.5 border-t">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 text-xs"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 