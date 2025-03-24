import { useState, useEffect, useRef } from 'react';
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
  XIcon,
} from '@heroicons/react/24/outline';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Reset loading state when media changes
  useEffect(() => {
    if (media) {
      setIsLoading(true);
    }
  }, [media]);
  
  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Reset video state when media changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [media]);
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  // If no media, don't render anything
  if (!media) return null;
  
  const hasNext = !!onNext && mediaList.length > 1;
  const hasPrevious = !!onPrevious && mediaList.length > 1;
  
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
            
            {media.media_type === MediaType.PHOTO ? (
              <Image
                src={media.url || ''}
                alt={media.title || 'Photo'}
                className={cn(
                  "max-h-full w-auto h-auto object-contain transition-opacity duration-300",
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                width={media.width || 1200}
                height={media.height || 800}
                quality={90}
                priority
                onLoad={() => setIsLoading(false)}
              />
            ) : (
              <video
                ref={videoRef}
                src={media.url || ''}
                className={cn(
                  "max-h-full w-auto h-auto object-contain transition-opacity duration-300",
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                controls={false}
                playsInline
                onLoadedData={() => setIsLoading(false)}
                muted={isMuted}
              />
            )}
            
            {/* Navigation Controls */}
            {!isLoading && (
              <>
                {hasPrevious && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-10 w-10 rounded-full"
                  >
                    <ArrowLeftIcon className="h-6 w-6" />
                  </Button>
                )}
                
                {hasNext && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white h-10 w-10 rounded-full"
                  >
                    <ArrowRightIcon className="h-6 w-6" />
                  </Button>
                )}
                
                {/* Video Controls */}
                {media.media_type === MediaType.VIDEO && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex flex-col space-y-2">
                      {/* Progress Bar */}
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 accent-white"
                      />
                      
                      <div className="flex items-center justify-between">
                        {/* Time Display */}
                        <div className="text-white text-xs">
                          {formatTimestamp(currentTime)} / {formatTimestamp(duration || 0)}
                        </div>
                        
                        {/* Control Buttons */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="h-8 w-8 text-white hover:bg-white/20"
                          >
                            {isPlaying ? (
                              <PauseIcon className="h-5 w-5" />
                            ) : (
                              <PlayIcon className="h-5 w-5" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="h-8 w-8 text-white hover:bg-white/20"
                          >
                            {isMuted ? (
                              <SpeakerXMarkIcon className="h-5 w-5" />
                            ) : (
                              <SpeakerWaveIcon className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Footer with Information and Controls */}
          {(showInfo || showControls) && (
            <DialogFooter className="flex-shrink-0 flex flex-row items-start justify-between gap-4 p-4 bg-background/80 backdrop-blur-sm">
              {/* Media Information */}
              {showInfo && (
                <div className="flex flex-col text-sm">
                  <p>
                    <span className="text-muted-foreground">Uploaded: </span>
                    {formatDate(media.created_at, { includeTime: true })}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4">
                    {media.media_type === MediaType.PHOTO && media.width && media.height && (
                      <p>
                        <span className="text-muted-foreground">Dimensions: </span>
                        {media.width} × {media.height}
                      </p>
                    )}
                    
                    {media.media_type === MediaType.VIDEO && media.duration && (
                      <p>
                        <span className="text-muted-foreground">Duration: </span>
                        {formatTimestamp(media.duration)}
                      </p>
                    )}
                    
                    {media.size && (
                      <p>
                        <span className="text-muted-foreground">Size: </span>
                        {formatFileSize(media.size)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              {showControls && (
                <div className="flex items-center space-x-2 shrink-0">
                  {onApprove && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApprove(media)}
                      className="text-green-600 border-green-600 hover:bg-green-600/10"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  
                  {onReject && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject(media)}
                      className="text-red-600 border-red-600 hover:bg-red-600/10"
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(media.url, '_blank')}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 