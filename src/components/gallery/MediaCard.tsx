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
        "overflow-hidden group transition-all duration-200 hover:shadow-md",
        className
      )}
      onClick={handleClick}
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
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title || 'Video thumbnail'}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoadingComplete={handleImageLoadComplete}
                  priority={priority}
                />
              ) : (
                <Play className="w-12 h-12 text-gray-400" />
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : '0:00'}
              </div>
            </div>
          ) : (
            <Image
              src={item.url || '/images/placeholder-image.jpg'}
              alt={item.title || 'Photo'}
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
              {item.media_type === 'video' ? (
                <Film className="w-3 h-3 mr-1" />
              ) : (
                <ImageIcon className="w-3 h-3 mr-1" />
              )}
              {item.media_type === 'video' ? 'Video' : 'Photo'}
            </Badge>
          </div>
          
          {/* Tags indicator */}
          {item.metadata?.tags && item.metadata.tags.length > 0 && (
            <div className="absolute top-2 right-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-black/50 text-white border-none">
                    <Tag className="w-3 h-3 mr-1" />
                    {item.metadata.tags.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    {item.metadata.tags.join(', ')}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          {/* Hover overlay with actions */}
          {showControls && isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {showApproval && item.status === MediaStatus.PENDING && (
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
              
              {showApproval && item.status === MediaStatus.APPROVED && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
              
              {showApproval && item.status === MediaStatus.REJECTED && (
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
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Size
                  </DropdownMenuItem>
                  {showEvent && item.event && (
                    <DropdownMenuItem asChild>
                      <Link href={`/events/${item.event_id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Event
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => {
                    const url = item.url || '';
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = item.title || 'Untitled';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                    <XCircle className="h-4 w-4 mr-2" />
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
          <h3 className="text-sm font-medium truncate flex-1" title={item.title || 'Untitled'}>
            {item.title || 'Untitled'}
          </h3>
        </div>
        
        <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
          {showEvent && item.event && (
            <Link href={`/events/${item.event_id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
              {item.event.name}
            </Link>
          )}
        </div>
      </CardFooter>
      
      {showComments && (
        <div className="px-3 mt-4 pt-4 border-t">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Comments ({item.comments?.length || 0})</h4>
              <CollapsibleTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  {isExpanded ? "Hide" : "Show"}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2 space-y-4">
              {item.comments && item.comments.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {item.comments.map(comment => (
                    <div key={comment.id} className="flex gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        {comment.author.avatarUrl && (
                          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                        )}
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-xs font-medium">{comment.author.name}</p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              )}
              
              <form onSubmit={handleCommentSubmit} className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Input 
                  className="h-8 text-sm flex-1" 
                  placeholder="Add a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button type="submit" size="sm" className="h-8 px-2" disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </Card>
  )
} 