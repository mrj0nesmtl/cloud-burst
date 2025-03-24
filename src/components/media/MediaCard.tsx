import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check as CheckIcon, 
  X as XIcon, 
  Trash as TrashIcon, 
  Pencil as PencilIcon, 
  Eye as EyeIcon, 
  Play as PlayIcon, 
  Pause as PauseIcon,
  Download as DownloadIcon
} from 'lucide-react';
import { Media, MediaStatus, MediaType } from '@/types/media';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatFileSize, formatTimestamp } from '@/lib/formatters';

interface MediaCardProps {
  media: Media;
  aspectRatio?: 'portrait' | 'square' | 'video' | 'auto';
  width?: number;
  height?: number;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (media: Media) => void;
  onApprove?: (media: Media) => void;
  onReject?: (media: Media) => void;
  onDelete?: (media: Media) => void;
  onEdit?: (media: Media) => void;
  onView?: (media: Media) => void;
  showControls?: boolean;
  showStatus?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export function MediaCard({
  media,
  aspectRatio = 'auto',
  width,
  height,
  selected = false,
  selectable = false,
  onSelect,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  onView,
  showControls = false,
  showStatus = true,
  className,
  actions,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const calculateAspectRatio = () => {
    if (aspectRatio !== 'auto') {
      return aspectRatio;
    }
    
    // If we have width and height, calculate aspect ratio
    if (media.width && media.height) {
      const ratio = media.width / media.height;
      
      if (ratio >= 1.2) {
        return 'video'; // 16:9 or similar
      } else if (ratio < 0.9) {
        return 'portrait';
      } else {
        return 'square';
      }
    }
    
    // Default to video aspect ratio for videos, square for photos
    return media.media_type === MediaType.VIDEO ? 'video' : 'square';
  };

  const getAspectRatioClass = () => {
    const ratio = calculateAspectRatio();
    
    switch (ratio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'square':
        return 'aspect-square';
      case 'video':
      default:
        return 'aspect-video';
    }
  };

  const handleVideoPlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(media);
    } else if (onView) {
      onView(media);
    }
  };

  const getStatusBadgeProps = () => {
    switch (media.status) {
      case MediaStatus.APPROVED:
        return {
          variant: 'success' as const,
          label: 'Approved',
          icon: <CheckIcon className="h-3 w-3" />
        };
      case MediaStatus.REJECTED:
        return {
          variant: 'destructive' as const,
          label: 'Rejected',
          icon: <XIcon className="h-3 w-3" />
        };
      case MediaStatus.PENDING:
      default:
        return {
          variant: 'outline' as const,
          label: 'Pending',
          icon: null
        };
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-200 group relative',
        selected ? 'ring-2 ring-primary' : '',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className={cn('relative overflow-hidden', getAspectRatioClass())}>
          {media.media_type === MediaType.PHOTO ? (
            <Image
              src={media.url || '/images/placeholder-image.jpg'}
              alt={media.title || 'Photo'}
              className="object-cover transition-transform group-hover:scale-105"
              fill
              sizes={width ? `${width}px` : '(max-width: 768px) 100vw, 300px'}
              priority={false}
            />
          ) : (
            <div className="relative w-full h-full bg-black">
              {/* Video thumbnail when not playing */}
              {!isPlaying && (
                <Image
                  src={media.thumbnail_url || '/images/placeholder-video.jpg'}
                  alt={media.title || 'Video'}
                  className="object-cover"
                  fill
                  sizes={width ? `${width}px` : '(max-width: 768px) 100vw, 300px'}
                  priority={false}
                />
              )}
              
              {/* Actual video element */}
              <video
                ref={setVideoRef}
                src={media.url}
                className={cn(
                  'w-full h-full object-cover', 
                  !isPlaying && 'opacity-0'
                )}
                playsInline
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Play/pause button */}
              <button
                className={cn(
                  'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                  'bg-black/50 rounded-full p-3 text-white transition-opacity',
                  'hover:bg-black/70',
                  (isHovered || !isPlaying) ? 'opacity-100' : 'opacity-0'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoPlay();
                }}
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
          
          {/* Duration badge for videos */}
          {media.media_type === MediaType.VIDEO && media.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatTimestamp(media.duration)}
            </div>
          )}
          
          {/* File size badge */}
          {media.size && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatFileSize(media.size)}
            </div>
          )}
          
          {/* Selection indicator */}
          {selectable && (
            <div 
              className={cn(
                'absolute top-2 right-2 rounded-full h-5 w-5 border-2',
                selected 
                  ? 'bg-primary border-primary' 
                  : 'bg-white/80 border-gray-400'
              )}
            >
              {selected && (
                <CheckIcon className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {(showStatus || showControls) && (
        <CardFooter className="p-2 flex flex-col gap-2">
          {showStatus && (
            <div className="w-full flex items-center justify-between">
              <Badge variant={getStatusBadgeProps().variant} className="text-xs flex items-center gap-1">
                {getStatusBadgeProps().icon}
                {getStatusBadgeProps().label}
              </Badge>
              
              {media.title && (
                <span className="text-xs text-muted-foreground truncate ml-2">
                  {media.title}
                </span>
              )}
            </div>
          )}
          
          {showControls && (
            <div className="flex items-center justify-center gap-1 w-full">
              {onView && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(media);
                  }}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              )}
              
              {onApprove && media.status !== MediaStatus.APPROVED && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 text-green-500 hover:text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(media);
                  }}
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
              )}
              
              {onReject && media.status !== MediaStatus.REJECTED && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(media);
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
              
              {onEdit && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(media);
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open in new tab
                  window.open(media.url, '_blank');
                }}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
              
              {onDelete && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(media);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 