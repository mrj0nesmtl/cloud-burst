"use client";

import React, { useCallback, useEffect, useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Media, MediaType } from '@/types/media';
import { 
  ArrowLeft, 
  ArrowRight, 
  Edit, 
  Maximize, 
  Minimize, 
  Info, 
  X,
  Download
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import { getProxiedMediaUrl } from '@/lib/utils/media-proxy';

interface MediaDetailsDialogProps {
  media: Media | null;
  mediaList?: Media[];
  currentIndex?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (media: Media) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showEditButton?: boolean;
}

export function MediaDetailsDialog({
  media,
  mediaList = [],
  currentIndex = 0,
  isOpen,
  onOpenChange,
  onEdit,
  onNext,
  onPrevious,
  showEditButton = false,
}: MediaDetailsDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum distance required for swipe
  const minSwipeDistance = 50;

  const hasNext = mediaList.length > 0 && currentIndex < mediaList.length - 1;
  const hasPrevious = mediaList.length > 0 && currentIndex > 0;
  
  const resetImageState = useCallback(() => {
    setIsLoading(true);
    setImageError(false);
  }, []);

  useEffect(() => {
    if (isOpen && media) {
      resetImageState();
      
      // Add keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' && onNext && hasNext) {
          onNext();
        } else if (e.key === 'ArrowLeft' && onPrevious && hasPrevious) {
          onPrevious();
        } else if (e.key === 'Escape') {
          setIsFullscreen(false);
        } else if (e.key === 'f') {
          setIsFullscreen(prev => !prev);
        } else if (e.key === 'i') {
          setShowInfo(prev => !prev);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, media, onNext, onPrevious, hasNext, hasPrevious, resetImageState]);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onNext && hasNext) {
      onNext();
    } else if (isRightSwipe && onPrevious && hasPrevious) {
      onPrevious();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  const toggleFullscreen = () => setIsFullscreen(prev => !prev);
  const toggleInfo = () => setShowInfo(prev => !prev);

  if (!media) return null;

  const mediaType = media.mediaType?.toLowerCase() || '';
  const isPhoto = mediaType === 'photo' || mediaType === MediaType.PHOTO || !mediaType;
  const isVideo = mediaType === 'video' || mediaType === MediaType.VIDEO;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        ref={contentRef}
        className={`
          sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw]
          ${isFullscreen ? 'h-[95vh] max-h-[95vh] p-2' : 'max-h-[90vh]'}
          overflow-hidden flex flex-col
          animate-in fade-in-0 zoom-in-95 duration-300
          w-full max-w-full
          p-3 sm:p-4
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-between items-center mb-2">
          <DialogTitle className="text-lg truncate max-w-[70%]">
            {media.title || 'Media Details'}
          </DialogTitle>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button
              onClick={toggleInfo}
              size="icon"
              variant="ghost"
              title="Toggle information panel (I)"
              aria-label="Toggle information"
              className="h-8 w-8"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggleFullscreen}
              size="icon"
              variant="ghost"
              title="Toggle fullscreen (F)"
              aria-label="Toggle fullscreen"
              className="h-8 w-8"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              size="icon"
              variant="ghost"
              title="Close (Escape)"
              aria-label="Close"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row ${isFullscreen ? 'h-full' : ''} w-full overflow-hidden gap-2 md:gap-4`}>
          {/* Media display area */}
          <div 
            className={`
              relative flex items-center justify-center 
              w-full md:${showInfo ? 'w-[65%]' : 'w-full'} 
              ${isFullscreen ? 'h-full' : 'h-[40vh] md:h-[60vh]'}
              overflow-hidden
              bg-muted/20 rounded-md
            `}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <span className="mt-2 text-sm text-muted-foreground">Loading media...</span>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 z-10">
              {hasPrevious && onPrevious && (
                <Button
                  onClick={onPrevious}
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all"
                  title="Previous image (Left arrow)"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-10">
              {hasNext && onNext && (
                <Button
                  onClick={onNext}
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all"
                  title="Next image (Right arrow)"
                  aria-label="Next image"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {isPhoto && media.url && (
              <img
                ref={imgRef}
                src={getProxiedMediaUrl(media.url)}
                alt={media.title || "Media item"}
                className={`
                  max-w-full max-h-full object-contain
                  ${isFullscreen ? 'h-full w-auto' : ''}
                  ${imageError ? 'hidden' : ''}
                  hover:cursor-zoom-in transition-all duration-200
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={toggleFullscreen}
                title="Click to toggle fullscreen"
              />
            )}
            
            {isVideo && media.url && (
              <video
                controls
                autoPlay={false}
                className="max-w-full max-h-full object-contain"
                src={getProxiedMediaUrl(media.url)}
                onLoadedData={handleImageLoad}
                onError={handleImageError}
                poster={media.thumbnailUrl ? getProxiedMediaUrl(media.thumbnailUrl) : undefined}
              >
                Your browser does not support the video tag.
              </video>
            )}
            
            {imageError && (
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-red-300 rounded-md bg-red-50/10 max-w-md mx-auto">
                <span className="text-red-500 font-semibold text-lg mb-2">Unable to load media</span>
                <p className="text-sm text-muted-foreground mb-3">We couldn't load the image from the server.</p>
                <details className="text-xs text-muted-foreground/70 w-full overflow-hidden">
                  <summary className="cursor-pointer">View technical details</summary>
                  <p className="mt-1 break-all whitespace-pre-wrap">{media.url}</p>
                </details>
              </div>
            )}
          </div>
          
          {/* Info panel */}
          {showInfo && (
            <div className={`
              w-full md:w-[35%] py-2 px-1 sm:p-3 overflow-y-auto
              ${isFullscreen ? 'h-full' : 'h-[40vh] md:h-[60vh]'}
              border-t md:border-t-0 md:border-l border-border
              flex flex-col
            `}>
              <h3 className="text-lg font-semibold mb-2 truncate">{media.title || 'Untitled'}</h3>
              
              {media.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{media.description}</p>
              )}
              
              <div className="space-y-2 text-sm flex-grow">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{media.mediaType || 'Unknown'}</span>
                </div>
                
                {media.width && media.height && (
                  <div className="flex justify-between">
                    <span className="font-medium">Dimensions:</span>
                    <span>{media.width} × {media.height}</span>
                  </div>
                )}
                
                {media.size && (
                  <div className="flex justify-between">
                    <span className="font-medium">Size:</span>
                    <span>{formatFileSize(media.size)}</span>
                  </div>
                )}
                
                {media.metadata?.duration && (
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{Math.round(media.metadata.duration)}s</span>
                  </div>
                )}
                
                {media.createdAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Uploaded:</span>
                    <span>{formatDate(media.createdAt)}</span>
                  </div>
                )}
                
                {media.status && (
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`
                      ${media.status === 'approved' ? 'text-green-500' : ''}
                      ${media.status === 'rejected' ? 'text-red-500' : ''}
                      ${media.status === 'pending' ? 'text-amber-500' : ''}
                    `}>
                      {media.status.charAt(0).toUpperCase() + media.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 border-t pt-3">
                <h4 className="text-sm font-medium mb-1">Actions</h4>
                <div className="flex flex-row gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-1 h-10"
                    onClick={() => {
                      // Open the original image in a new tab for download
                      window.open(media.url, '_blank');
                    }}
                    title="Download original image"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                  {showEditButton && onEdit && (
                    <Button
                      size="sm" 
                      variant="default"
                      className="w-full flex items-center justify-center gap-1 h-10"
                      onClick={() => onEdit(media)}
                      title="Edit media details"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="mt-3 border-t pt-3 hidden sm:block">
                <h4 className="text-sm font-medium mb-1">Keyboard Navigation</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono mr-2">←</kbd>
                    <span>Previous image</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono mr-2">→</kbd>
                    <span>Next image</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono mr-2">F</kbd>
                    <span>Toggle fullscreen</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono mr-2">I</kbd>
                    <span>Toggle info panel</span>
                  </div>
                  <div className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono mr-2">Esc</kbd>
                    <span>Exit fullscreen/Close</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs">Swipe left/right on touch devices</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 