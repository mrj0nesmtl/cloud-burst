"use client"

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Media, 
  MediaType, 
  GalleryLayout, 
  GallerySortOption,
  GalleryFilter,
  MediaLayout,
  MediaStatus,
  Album,
  CreateMediaParams,
  MediaUploadProgress,
  mapDbMediaToMedia
} from '@/types/media';
import mediaService from '@/lib/supabase/media';

export interface MediaState {
  // Media data
  eventMedia: Media[];
  approvedMedia: Media[];
  pendingMedia: Media[];
  rejectedMedia: Media[];
  userMedia: Media[];
  albumMedia: Record<string, Media[]>;
  currentMedia: Media | null;
  albums: Album[];
  
  // Loading states
  isLoadingEventMedia: boolean;
  isLoadingApprovedMedia: boolean;
  isLoadingPendingMedia: boolean;
  isLoadingRejectedMedia: boolean;
  isLoadingUserMedia: boolean;
  isLoadingAlbumMedia: Record<string, boolean>;
  isLoadingAlbums: boolean;
  
  // Upload states
  uploadProgress: MediaUploadProgress[];
  
  // Filter states
  mediaTypeFilter: MediaType | 'all';
  mediaStatusFilter: MediaStatus | 'all';
  sortBy: 'newest' | 'oldest' | 'name' | 'size';
  
  // Error states
  eventMediaError: Error | null;
  approvedMediaError: Error | null;
  pendingMediaError: Error | null;
  rejectedMediaError: Error | null;
  userMediaError: Error | null;
  albumMediaError: Record<string, Error | null>;
  albumsError: Error | null;
  
  // Actions
  fetchEventMedia: (eventId: string) => Promise<void>;
  fetchApprovedEventMedia: (eventId: string) => Promise<void>;
  fetchPendingEventMedia: (eventId: string) => Promise<void>;
  fetchRejectedEventMedia: (eventId: string) => Promise<void>;
  fetchUserMedia: () => Promise<void>;
  fetchAlbumMedia: (albumId: string) => Promise<void>;
  fetchEventAlbums: (eventId: string) => Promise<void>;
  setCurrentMedia: (media: Media | null) => void;
  
  // Media actions
  uploadMediaFile: (file: File, eventId: string, userId: string) => Promise<Media | null>;
  updateMediaItem: (id: string, title?: string, description?: string, status?: MediaStatus) => Promise<Media | null>;
  approveMediaItem: (id: string, reason?: string) => Promise<Media | null>;
  rejectMediaItem: (id: string, reason?: string) => Promise<Media | null>;
  deleteMediaItem: (id: string) => Promise<boolean>;
  
  // Filter actions
  setMediaTypeFilter: (filter: MediaType | 'all') => void;
  setMediaStatusFilter: (filter: MediaStatus | 'all') => void;
  setSortBy: (sort: 'newest' | 'oldest' | 'name' | 'size') => void;
  
  // Helpers
  getFilteredMedia: (media: Media[]) => Media[];
  clearErrors: () => void;
}

export const useMediaStore = create<MediaState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        eventMedia: [],
        approvedMedia: [],
        pendingMedia: [],
        rejectedMedia: [],
        userMedia: [],
        albumMedia: {},
        currentMedia: null,
        albums: [],
        
        isLoadingEventMedia: false,
        isLoadingApprovedMedia: false,
        isLoadingPendingMedia: false,
        isLoadingRejectedMedia: false,
        isLoadingUserMedia: false,
        isLoadingAlbumMedia: {},
        isLoadingAlbums: false,
        
        uploadProgress: [],
        
        mediaTypeFilter: 'all',
        mediaStatusFilter: 'all',
        sortBy: 'newest',
        
        eventMediaError: null,
        approvedMediaError: null,
        pendingMediaError: null,
        rejectedMediaError: null,
        userMediaError: null,
        albumMediaError: {},
        albumsError: null,
        
        // Fetch all media for an event
        fetchEventMedia: async (eventId: string) => {
          set({ isLoadingEventMedia: true, eventMediaError: null });
          
          try {
            const media = await mediaService.getEventMedia(eventId);
            set({ eventMedia: media, isLoadingEventMedia: false });
          } catch (error) {
            console.error('Error fetching event media:', error);
            set({ 
              eventMediaError: error instanceof Error ? error : new Error('Failed to fetch event media'), 
              isLoadingEventMedia: false 
            });
          }
        },
        
        // Fetch approved media for an event
        fetchApprovedEventMedia: async (eventId: string) => {
          set({ isLoadingApprovedMedia: true, approvedMediaError: null });
          
          try {
            const media = await mediaService.getApprovedEventMedia(eventId);
            set({ approvedMedia: media, isLoadingApprovedMedia: false });
          } catch (error) {
            console.error('Error fetching approved media:', error);
            set({ 
              approvedMediaError: error instanceof Error ? error : new Error('Failed to fetch approved media'), 
              isLoadingApprovedMedia: false 
            });
          }
        },
        
        // Fetch pending media for an event
        fetchPendingEventMedia: async (eventId: string) => {
          set({ isLoadingPendingMedia: true, pendingMediaError: null });
          
          try {
            const media = await mediaService.getPendingEventMedia(eventId);
            set({ pendingMedia: media, isLoadingPendingMedia: false });
          } catch (error) {
            console.error('Error fetching pending media:', error);
            set({ 
              pendingMediaError: error instanceof Error ? error : new Error('Failed to fetch pending media'), 
              isLoadingPendingMedia: false 
            });
          }
        },
        
        // Fetch rejected media for an event
        fetchRejectedEventMedia: async (eventId: string) => {
          set({ isLoadingRejectedMedia: true, rejectedMediaError: null });
          
          try {
            const media = await mediaService.getRejectedEventMedia(eventId);
            set({ rejectedMedia: media, isLoadingRejectedMedia: false });
          } catch (error) {
            console.error('Error fetching rejected media:', error);
            set({ 
              rejectedMediaError: error instanceof Error ? error : new Error('Failed to fetch rejected media'), 
              isLoadingRejectedMedia: false 
            });
          }
        },
        
        // Fetch media uploaded by the current user
        fetchUserMedia: async () => {
          set({ isLoadingUserMedia: true, userMediaError: null });
          
          try {
            const media = await mediaService.getUserMedia();
            set({ userMedia: media, isLoadingUserMedia: false });
          } catch (error) {
            console.error('Error fetching user media:', error);
            set({ 
              userMediaError: error instanceof Error ? error : new Error('Failed to fetch user media'), 
              isLoadingUserMedia: false 
            });
          }
        },
        
        // Fetch media in an album
        fetchAlbumMedia: async (albumId: string) => {
          set(state => ({ 
            isLoadingAlbumMedia: { 
              ...state.isLoadingAlbumMedia, 
              [albumId]: true 
            },
            albumMediaError: {
              ...state.albumMediaError,
              [albumId]: null
            }
          }));
          
          try {
            const media = await mediaService.getAlbumMedia(albumId);
            set(state => ({ 
              albumMedia: { 
                ...state.albumMedia, 
                [albumId]: media 
              },
              isLoadingAlbumMedia: {
                ...state.isLoadingAlbumMedia,
                [albumId]: false
              }
            }));
          } catch (error) {
            console.error(`Error fetching album ${albumId} media:`, error);
            set(state => ({ 
              albumMediaError: { 
                ...state.albumMediaError, 
                [albumId]: error instanceof Error ? error : new Error(`Failed to fetch album ${albumId} media`) 
              },
              isLoadingAlbumMedia: {
                ...state.isLoadingAlbumMedia,
                [albumId]: false
              }
            }));
          }
        },
        
        // Fetch albums for an event
        fetchEventAlbums: async (eventId: string) => {
          set({ isLoadingAlbums: true, albumsError: null });
          
          try {
            const albums = await mediaService.getEventAlbums(eventId);
            set({ albums, isLoadingAlbums: false });
          } catch (error) {
            console.error('Error fetching event albums:', error);
            set({ 
              albumsError: error instanceof Error ? error : new Error('Failed to fetch event albums'), 
              isLoadingAlbums: false 
            });
          }
        },
        
        // Set the current media
        setCurrentMedia: (media: Media | null) => {
          set({ currentMedia: media });
        },
        
        // Upload a media file
        uploadMediaFile: async (file: File, eventId: string, userId: string) => {
          // Create a unique ID for tracking this upload
          const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          
          // Add to upload progress
          set(state => ({
            uploadProgress: [
              ...state.uploadProgress,
              {
                id: uploadId,
                file,
                progress: 0,
                status: 'pending'
              }
            ]
          }));
          
          try {
            // Start upload
            set(state => ({
              uploadProgress: state.uploadProgress.map(p => 
                p.id === uploadId ? { ...p, status: 'uploading' } : p
              )
            }));
            
            // Function to update progress
            const updateProgress = (progress: number) => {
              set(state => ({
                uploadProgress: state.uploadProgress.map(p => 
                  p.id === uploadId ? { ...p, progress } : p
                )
              }));
            };
            
            // Upload file to storage
            const uploadResult = await mediaService.uploadMedia(file, eventId, updateProgress);
            
            if (!uploadResult) {
              throw new Error('Failed to upload file');
            }
            
            // Determine media type
            const mediaType = file.type.startsWith('video/') ? MediaType.VIDEO : MediaType.PHOTO;
            
            // Get dimensions for images
            let width = undefined;
            let height = undefined;
            let duration = undefined;
            
            if (mediaType === MediaType.PHOTO) {
              // Get image dimensions
              const img = new Image();
              img.src = URL.createObjectURL(file);
              await new Promise(resolve => {
                img.onload = () => {
                  width = img.width;
                  height = img.height;
                  URL.revokeObjectURL(img.src);
                  resolve(true);
                };
              });
            } else if (mediaType === MediaType.VIDEO) {
              // Get video dimensions and duration
              const video = document.createElement('video');
              video.preload = 'metadata';
              video.src = URL.createObjectURL(file);
              await new Promise(resolve => {
                video.onloadedmetadata = () => {
                  width = video.videoWidth;
                  height = video.videoHeight;
                  duration = Math.round(video.duration);
                  URL.revokeObjectURL(video.src);
                  resolve(true);
                };
              });
            }
            
            // Create media record in database
            const mediaParams: CreateMediaParams = {
              eventId,
              userId,
              mediaType,
              filePath: uploadResult.path,
              filename: file.name,
              url: uploadResult.url,
              thumbnailUrl: undefined,
              title: file.name,
              description: undefined,
              size: file.size,
              mimeType: file.type,
              width,
              height,
              duration
            };
            
            const media = await mediaService.createMedia(mediaParams);
            
            if (!media) {
              throw new Error('Failed to create media record');
            }
            
            // Update progress to complete
            set(state => ({
              uploadProgress: state.uploadProgress.map(p => 
                p.id === uploadId ? { ...p, progress: 100, status: 'complete' } : p
              ),
              // Add to event media if we're currently viewing this event
              eventMedia: state.eventMedia.some(m => m.event_id === eventId) 
                ? [media, ...state.eventMedia]
                : state.eventMedia,
              // Add to pending media if we're currently viewing this event
              pendingMedia: state.pendingMedia.some(m => m.event_id === eventId)
                ? [media, ...state.pendingMedia]
                : state.pendingMedia,
              // Add to user media
              userMedia: [media, ...state.userMedia]
            }));
            
            return media;
          } catch (error) {
            console.error('Error uploading media:', error);
            
            // Update progress to error
            set(state => ({
              uploadProgress: state.uploadProgress.map(p => 
                p.id === uploadId ? { 
                  ...p, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Unknown error' 
                } : p
              )
            }));
            
            return null;
          }
        },
        
        // Update a media item
        updateMediaItem: async (id: string, title?: string, description?: string, status?: MediaStatus) => {
          try {
            const media = await mediaService.updateMedia({ id, title, description, status });
            
            if (!media) {
              throw new Error('Failed to update media');
            }
            
            // Update media in all relevant state arrays
            set(state => ({
              eventMedia: state.eventMedia.map(m => m.id === id ? media : m),
              approvedMedia: state.approvedMedia.map(m => m.id === id ? media : m),
              pendingMedia: state.pendingMedia.filter(m => m.id !== id), // Remove from pending if approved
              rejectedMedia: state.rejectedMedia.filter(m => m.id !== id), // Remove from rejected if approved
              userMedia: state.userMedia.map(m => m.id === id ? media : m),
              albumMedia: Object.fromEntries(
                Object.entries(state.albumMedia).map(([albumId, albumMedia]) => [
                  albumId,
                  albumMedia.map(m => m.id === id ? media : m)
                ])
              ),
              currentMedia: state.currentMedia?.id === id ? media : state.currentMedia
            }));
            
            // If status changed to approved, add to approved media
            if (status === MediaStatus.APPROVED) {
              set(state => ({
                approvedMedia: [media, ...state.approvedMedia.filter(m => m.id !== id)]
              }));
            }
            
            // If status changed to rejected, add to rejected media
            if (status === MediaStatus.REJECTED) {
              set(state => ({
                rejectedMedia: [media, ...state.rejectedMedia.filter(m => m.id !== id)]
              }));
            }
            
            return media;
          } catch (error) {
            console.error('Error updating media:', error);
            return null;
          }
        },
        
        // Approve a media item
        approveMediaItem: async (id: string, reason?: string) => {
          try {
            const media = await mediaService.approveMedia(id, reason);
            
            if (!media) {
              throw new Error('Failed to approve media');
            }
            
            // Update media in all relevant state arrays
            set(state => ({
              eventMedia: state.eventMedia.map(m => m.id === id ? media : m),
              approvedMedia: [media, ...state.approvedMedia.filter(m => m.id !== id)],
              pendingMedia: state.pendingMedia.filter(m => m.id !== id), // Remove from pending
              rejectedMedia: state.rejectedMedia.filter(m => m.id !== id), // Remove from rejected
              userMedia: state.userMedia.map(m => m.id === id ? media : m),
              albumMedia: Object.fromEntries(
                Object.entries(state.albumMedia).map(([albumId, albumMedia]) => [
                  albumId,
                  albumMedia.map(m => m.id === id ? media : m)
                ])
              ),
              currentMedia: state.currentMedia?.id === id ? media : state.currentMedia
            }));
            
            return media;
          } catch (error) {
            console.error('Error approving media:', error);
            return null;
          }
        },
        
        // Reject a media item
        rejectMediaItem: async (id: string, reason?: string) => {
          try {
            const media = await mediaService.rejectMedia(id, reason);
            
            if (!media) {
              throw new Error('Failed to reject media');
            }
            
            // Update media in all relevant state arrays
            set(state => ({
              eventMedia: state.eventMedia.map(m => m.id === id ? media : m),
              approvedMedia: state.approvedMedia.filter(m => m.id !== id), // Remove from approved
              pendingMedia: state.pendingMedia.filter(m => m.id !== id), // Remove from pending
              rejectedMedia: [media, ...state.rejectedMedia.filter(m => m.id !== id)],
              userMedia: state.userMedia.map(m => m.id === id ? media : m),
              albumMedia: Object.fromEntries(
                Object.entries(state.albumMedia).map(([albumId, albumMedia]) => [
                  albumId,
                  albumMedia.map(m => m.id === id ? media : m)
                ])
              ),
              currentMedia: state.currentMedia?.id === id ? media : state.currentMedia
            }));
            
            return media;
          } catch (error) {
            console.error('Error rejecting media:', error);
            return null;
          }
        },
        
        // Delete a media item
        deleteMediaItem: async (id: string) => {
          try {
            const success = await mediaService.deleteMedia(id);
            
            if (!success) {
              throw new Error('Failed to delete media');
            }
            
            // Remove media from all state arrays
            set(state => ({
              eventMedia: state.eventMedia.filter(m => m.id !== id),
              approvedMedia: state.approvedMedia.filter(m => m.id !== id),
              pendingMedia: state.pendingMedia.filter(m => m.id !== id),
              rejectedMedia: state.rejectedMedia.filter(m => m.id !== id),
              userMedia: state.userMedia.filter(m => m.id !== id),
              albumMedia: Object.fromEntries(
                Object.entries(state.albumMedia).map(([albumId, albumMedia]) => [
                  albumId,
                  albumMedia.filter(m => m.id !== id)
                ])
              ),
              currentMedia: state.currentMedia?.id === id ? null : state.currentMedia
            }));
            
            return true;
          } catch (error) {
            console.error('Error deleting media:', error);
            return false;
          }
        },
        
        // Set media type filter
        setMediaTypeFilter: (filter: MediaType | 'all') => {
          set({ mediaTypeFilter: filter });
        },
        
        // Set media status filter
        setMediaStatusFilter: (filter: MediaStatus | 'all') => {
          set({ mediaStatusFilter: filter });
        },
        
        // Set sort by
        setSortBy: (sort: 'newest' | 'oldest' | 'name' | 'size') => {
          set({ sortBy: sort });
        },
        
        // Get filtered and sorted media
        getFilteredMedia: (media: Media[]) => {
          const { mediaTypeFilter, mediaStatusFilter, sortBy } = get();
          
          // Filter by media type
          let filtered = media;
          if (mediaTypeFilter !== 'all') {
            filtered = filtered.filter(m => m.media_type === mediaTypeFilter);
          }
          
          // Filter by status
          if (mediaStatusFilter !== 'all') {
            filtered = filtered.filter(m => m.status === mediaStatusFilter);
          }
          
          // Sort
          return [...filtered].sort((a, b) => {
            if (sortBy === 'newest') {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortBy === 'oldest') {
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            if (sortBy === 'name') {
              return (a.title || a.id).localeCompare(b.title || b.id);
            }
            if (sortBy === 'size') {
              return (b.size || 0) - (a.size || 0);
            }
            return 0;
          });
        },
        
        // Clear all errors
        clearErrors: () => {
          set({ 
            eventMediaError: null,
            approvedMediaError: null,
            pendingMediaError: null,
            rejectedMediaError: null,
            userMediaError: null,
            albumMediaError: {},
            albumsError: null
          });
        }
      }),
      {
        name: 'media-store',
        partialize: (state) => ({
          mediaTypeFilter: state.mediaTypeFilter,
          mediaStatusFilter: state.mediaStatusFilter,
          sortBy: state.sortBy
        })
      }
    )
  )
); 