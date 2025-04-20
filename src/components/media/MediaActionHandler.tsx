"use client";

import { useState, useCallback, useEffect } from 'react';
import { Media } from '@/types/media';
import { MediaDetailsDialog } from './MediaDetailsDialog';
import { MediaEditDialog } from './MediaEditDialog';

interface MediaActionHandlerProps {
  token?: string;
  media?: Media;
  mediaList?: Media[];
  onMediaUpdated?: (updatedMedia: Media) => void;
  showEditButton?: boolean;
  onViewStateChange?: (isOpen: boolean) => void;
}

export function MediaActionHandler({
  token,
  media,
  mediaList = [],
  onMediaUpdated,
  showEditButton = false,
  onViewStateChange,
}: MediaActionHandlerProps) {
  const [viewingMedia, setViewingMedia] = useState<Media | null>(null);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Initialize the current index based on the selected media
  useEffect(() => {
    if (media && mediaList.length > 0) {
      const index = mediaList.findIndex(item => 
        item.id === media.id || 
        (item.url && media.url && item.url === media.url)
      );
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, [media, mediaList]);

  // Update viewing media when initial media prop changes
  useEffect(() => {
    if (media) {
      setViewingMedia(media);
      if (onViewStateChange) onViewStateChange(true);
    }
  }, [media, onViewStateChange]);

  const handleViewMedia = useCallback((media: Media) => {
    setViewingMedia(media);
    if (onViewStateChange) onViewStateChange(true);
    
    // Find and set current index
    if (mediaList.length > 0) {
      const index = mediaList.findIndex(item => item.id === media.id);
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, [mediaList, onViewStateChange]);

  const handleCloseView = useCallback(() => {
    setViewingMedia(null);
    if (onViewStateChange) onViewStateChange(false);
  }, [onViewStateChange]);

  const handleEditMedia = useCallback((media: Media) => {
    setEditingMedia(media);
    setViewingMedia(null);
    if (onViewStateChange) onViewStateChange(false);
  }, [onViewStateChange]);

  const handleCloseEdit = useCallback(() => {
    setEditingMedia(null);
    // Return to viewing the media after editing
    if (viewingMedia) {
      setViewingMedia(viewingMedia);
      if (onViewStateChange) onViewStateChange(true);
    }
  }, [viewingMedia, onViewStateChange]);

  const handleMediaUpdated = useCallback((updatedMedia: Media) => {
    // Update the media in the media list
    if (mediaList.length > 0) {
      const updatedList = mediaList.map(item => 
        item.id === updatedMedia.id ? updatedMedia : item
      );
      
      // Call the parent's onMediaUpdated if provided
      if (onMediaUpdated) {
        onMediaUpdated(updatedMedia);
      }
    } else if (onMediaUpdated) {
      onMediaUpdated(updatedMedia);
    }
    
    // Close the edit dialog and update the viewing media
    setEditingMedia(null);
    setViewingMedia(updatedMedia);
  }, [mediaList, onMediaUpdated]);

  const handleNextMedia = useCallback(() => {
    if (mediaList.length > currentIndex + 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setViewingMedia(mediaList[nextIndex]);
    }
  }, [mediaList, currentIndex]);

  const handlePreviousMedia = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setViewingMedia(mediaList[prevIndex]);
    }
  }, [mediaList, currentIndex]);

  return (
    <>
      <MediaDetailsDialog 
        media={viewingMedia}
        mediaList={mediaList}
        currentIndex={currentIndex}
        isOpen={!!viewingMedia}
        onOpenChange={(open) => !open && handleCloseView()}
        onEdit={handleEditMedia}
        onNext={handleNextMedia}
        onPrevious={handlePreviousMedia}
        showEditButton={showEditButton}
      />

      <MediaEditDialog 
        media={editingMedia}
        token={token}
        isOpen={!!editingMedia}
        onOpenChange={(open) => !open && handleCloseEdit()}
        onMediaUpdated={handleMediaUpdated}
      />
    </>
  );
} 