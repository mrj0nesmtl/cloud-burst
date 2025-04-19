import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Media, MediaType } from '@/types/media';
import { formatFileSize, formatTimestamp, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  DownloadIcon,
  InfoIcon,
  VolumeIcon,
  Volume2Icon,
  MaximizeIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MediaViewerProps {
  media: Media | null;
  mediaList?: Media[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onApprove?: (media: Media) => void;
  onReject?: (media: Media) => void;
  showControls?: boolean;
  showInfo?: boolean;
}

export function MediaViewer({
  media,
  mediaList = [],
  isOpen,
  onOpenChange,
  onNext,
  onPrevious,
  onApprove,
  onReject,
  showControls = true,
  showInfo = true,
}: MediaViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [showNavigationControls, setShowNavigationControls] = useState(false);
  const [infoVisible, setInfoVisible] = useState(showInfo);
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const isVideo = media?.mediaType?.toLowerCase() === 'video';
  const hasNext = Boolean(onNext && mediaList.length > 1 && mediaList.indexOf(media) < mediaList.length - 1);
  const hasPrevious = Boolean(onPrevious && mediaList.length > 1 && mediaList.indexOf(media) > 0);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setIsMediaLoaded(false);
    }
  }, [isOpen, media?.id]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) onPrevious();
          break;
        case 'ArrowRight':
          if (hasNext && onNext) onNext();
          break;
        case 'Escape':
          onOpenChange(false);
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious]);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Threshold for swipe detection (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0 && hasNext && onNext) {
        // Swipe left -> next
        onNext();
      } else if (diff < 0 && hasPrevious && onPrevious) {
        // Swipe right -> previous
        onPrevious();
      }
    }
  };

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsMediaLoaded(true);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = Number(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Show/hide navigation controls when mouse moves
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowNavigationControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        setShowNavigationControls(false);
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseMove);
    }
    
    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseMove);
      }
    };
  }, [isMediaLoaded]);

  const mediaUrl = media?.url || '';
  const mediaThumbnailUrl = media?.thumbnailUrl || media?.url || '';

  // If no media, don't render anything
  if (!media) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "w-full max-w-6xl p-0 overflow-hidden bg-background/95 backdrop-blur",
          isFullscreen && "fixed inset-0 w-screen h-screen max-w-none rounded-none"
        )}
      >
        <div 
          ref={containerRef} 
          className="relative flex flex-col h-full max-h-[85vh] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Controls */}
          <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
            <DialogTitle className="text-lg truncate max-w-[calc(100%-120px)]">
              {media.title || 'Media Preview'}
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-4 w-4" />
                ) : (
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                )}
              </Button>
              
              <DialogClose asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          
          {/* Media Content */}
          <div className="flex-grow relative flex items-center justify-center bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Skeleton className="w-full h-full absolute" />
              </div>
            )}
            
            {/* Debug info - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-2 z-50 max-w-full overflow-hidden">
                <div>URL: {media.url || 'No URL'}</div>
                <div>Type: {media.mediaType || 'Unknown'}</div>
                <div>Size: {media.width}x{media.height}</div>
              </div>
            )}
            
            {/* Carousel Navigation Controls */}
            {showControls && isMediaLoaded && (
              <>
                {/* Left Navigation */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 flex items-center transition-opacity duration-300",
                  (showNavigationControls || !isMediaLoaded) ? "opacity-100" : "opacity-0",
                  hasPrevious ? "cursor-pointer" : "cursor-default"
                )}>
                  {hasPrevious && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-full bg-black/50 text-white ml-4 hover:bg-black/70"
                      onClick={onPrevious}
                    >
                      <ChevronLeftIcon size={24} />
                    </Button>
                  )}
                </div>

                {/* Right Navigation */}
                <div className={cn(
                  "absolute right-0 top-0 bottom-0 flex items-center transition-opacity duration-300",
                  (showNavigationControls || !isMediaLoaded) ? "opacity-100" : "opacity-0",
                  hasNext ? "cursor-pointer" : "cursor-default"
                )}>
                  {hasNext && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 rounded-full bg-black/50 text-white mr-4 hover:bg-black/70"
                      onClick={onNext}
                    >
                      <ChevronRightIcon size={24} />
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {media.mediaType === MediaType.PHOTO || media.mediaType === 'PHOTO' || (!media.mediaType && media.url) ? (
              <>
                {media.url ? (
                  <img
                    ref={imageRef}
                    src={mediaUrl}
                    alt={media.title || 'Photo'}
                    className={cn(
                      "max-h-full max-w-full object-contain transition-opacity duration-300",
                      isMediaLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                      setIsMediaLoaded(true);
                      setIsLoading(false);
                    }}
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      setIsLoading(false);
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-white p-8">
                    <span className="text-lg font-medium mb-2">Image not available</span>
                    <span className="text-sm text-gray-400">The image URL is missing or invalid</span>
                  </div>
                )}
              </>
            ) : (
              <video
                ref={videoRef}
                src={mediaUrl}
                poster={mediaThumbnailUrl}
                className={cn(
                  "max-h-full max-w-full object-contain transition-opacity duration-300",
                  isMediaLoaded ? "opacity-100" : "opacity-0"
                )}
                controls={false}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error("Error loading video:", e);
                  setIsLoading(false);
                }}
              />
            )}
          </div>
          
          {/* Info Panel */}
          {infoVisible && !isLoading && (
            <div className="flex-shrink-0 p-4 bg-background/95 border-t">
              <div className="flex flex-col space-y-2">
                {media.title && (
                  <h3 className="text-base font-medium">{media.title}</h3>
                )}
                
                {media.description && (
                  <p className="text-sm text-muted-foreground">{media.description}</p>
                )}
                
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mt-1">
                  {media.createdAt && (
                    <span>Uploaded: {formatDate(media.createdAt)}</span>
                  )}
                  
                  {media.size && (
                    <span>Size: {formatFileSize(media.size)}</span>
                  )}
                  
                  {media.width && media.height && (
                    <span>Dimensions: {media.width} × {media.height}</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Video Controls */}
          {!isLoading && media.mediaType === MediaType.VIDEO && videoRef.current && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white h-8 w-8"
              >
                {isPlaying ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </Button>
              
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-grow h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white h-8 w-8"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="h-5 w-5" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
          
          {/* Action Buttons */}
          {showControls && !isLoading && (
            <DialogFooter className="flex-shrink-0 p-4 bg-background border-t">
              <div className="flex w-full justify-between items-center">
                <div className="flex-1">
                  {media.url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (media.url) window.open(media.url, '_blank');
                      }}
                      className="text-xs gap-1"
                    >
                      <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {onReject && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onReject(media)}
                    >
                      Reject
                    </Button>
                  )}
                  
                  {onApprove && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onApprove(media)}
                      className="gap-1"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 