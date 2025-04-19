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
import { Media } from '@/types/media';
import { 
  ArrowLeft, 
  ArrowRight, 
  Edit, 
  Maximize, 
  Minimize, 
  Info, 
  X
} from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

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

  const mediaType = typeof media.type === 'string' 
    ? media.type.toLowerCase() 
    : '';
  
  const isPhoto = mediaType === 'photo';
  const isVideo = mediaType === 'video';

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
          sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] 
          ${isFullscreen ? 'h-[95vh] max-h-[95vh] p-2' : 'max-h-[85vh]'}
          overflow-hidden flex flex-col
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-between items-center p-2">
          <DialogTitle className="text-lg">
            {media.title || 'Media Details'}
          </DialogTitle>
          <div className="flex gap-2">
            {showEditButton && onEdit && (
              <Button
                onClick={() => onEdit(media)}
                size="icon"
                variant="ghost"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={toggleInfo}
              size="icon"
              variant="ghost"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggleFullscreen}
              size="icon"
              variant="ghost"
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
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`flex ${isFullscreen ? 'h-full' : ''}`}>
          {/* Media display area */}
          <div 
            className={`
              relative flex items-center justify-center 
              ${showInfo ? 'w-[70%]' : 'w-full'} 
              ${isFullscreen ? 'h-full' : 'max-h-[70vh]'}
              overflow-hidden
            `}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              {hasPrevious && onPrevious && (
                <Button
                  onClick={onPrevious}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center">
              {hasNext && onNext && (
                <Button
                  onClick={onNext}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {isPhoto && media.url && (
              <img
                ref={imgRef}
                src={media.url}
                alt={media.title || "Media item"}
                className={`
                  max-w-full max-h-full object-contain
                  ${isFullscreen ? 'h-full w-auto' : ''}
                  ${imageError ? 'hidden' : ''}
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
            
            {isVideo && media.url && (
              <video
                controls
                autoPlay={false}
                className="max-w-full max-h-full object-contain"
                src={media.url}
                onLoadedData={handleImageLoad}
                onError={handleImageError}
              >
                Your browser does not support the video tag.
              </video>
            )}
            
            {imageError && (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <span className="text-red-500 font-semibold">Unable to load media</span>
                <p className="text-sm text-muted-foreground">URL: {media.url}</p>
              </div>
            )}
          </div>
          
          {/* Info panel */}
          {showInfo && (
            <div className={`w-[30%] p-4 overflow-y-auto ${isFullscreen ? 'h-full' : 'max-h-[70vh]'}`}>
              <h3 className="text-lg font-semibold mb-2">{media.title || 'Untitled'}</h3>
              
              {media.description && (
                <p className="text-sm text-muted-foreground mb-4">{media.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{media.type || 'Unknown'}</span>
                </div>
                
                {media.width && media.height && (
                  <div className="flex justify-between">
                    <span className="font-medium">Dimensions:</span>
                    <span>{media.width} × {media.height}</span>
                  </div>
                )}
                
                {media.fileSize && (
                  <div className="flex justify-between">
                    <span className="font-medium">Size:</span>
                    <span>{formatFileSize(media.fileSize)}</span>
                  </div>
                )}
                
                {media.duration && (
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{Math.round(media.duration)}s</span>
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
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Navigation</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <ArrowLeft className="h-3 w-3 mr-1" /> 
                    <span>Previous image</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-3 w-3 mr-1" /> 
                    <span>Next image</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-mono mr-1">F</span> 
                    <span>Toggle fullscreen</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-mono mr-1">I</span> 
                    <span>Toggle info</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-mono mr-1">Esc</span> 
                    <span>Exit fullscreen</span>
                  </div>
                  <div className="flex items-center">
                    <span>Swipe left/right</span>
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