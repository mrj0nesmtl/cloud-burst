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
  MediaStatus
} from '@/types/media';
import {
  getEventMedia,
  getApprovedEventMedia,
  getPendingEventMedia,
  getMediaById,
  updateMediaApproval,
  deleteMedia,
  getMediaUrl,
  approveMediaItem,
  rejectMediaItem,
  getEventPendingMedia,
  getEventApprovedMedia,
  getEventRejectedMedia
} from '@/lib/supabase/media';

export interface MediaState {
  // Media Data
  media: Media[];
  currentEventId: string | null;
  currentMediaId: string | null;
  currentMedia: Media | null;
  loadingMedia: boolean;
  loadingMediaError: string | null;
  
  // Layout and Display Settings
  layout: GalleryLayout;
  sortOption: GallerySortOption;
  filter: GalleryFilter;
  
  // Upload State
  uploads: Record<string, {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    mediaId?: string;
  }>;
  
  // Actions
  fetchEventMedia: (eventId: string, mediaType?: MediaType) => Promise<Media[]>;
  fetchApprovedEventMedia: (eventId: string, mediaType?: MediaType) => Promise<Media[]>;
  fetchPendingEventMedia: (eventId: string, mediaType?: MediaType) => Promise<Media[]>;
  fetchMediaById: (mediaId: string) => Promise<Media | null>;
  approveMedia: (mediaId: string) => Promise<boolean>;
  rejectMedia: (mediaId: string) => Promise<boolean>;
  removeMedia: (mediaId: string) => Promise<boolean>;
  getMediaPublicUrl: (storagePath: string) => Promise<string | null>;
  
  // Media Filtering and Sorting
  setLayout: (layout: GalleryLayout) => void;
  setSortOption: (sortOption: GallerySortOption) => void;
  setFilter: (filter: GalleryFilter) => void;
  clearFilters: () => void;
  
  // Upload Management
  addUpload: (file: File) => string;
  updateUploadProgress: (id: string, progress: number) => void;
  setUploadStatus: (id: string, status: 'pending' | 'uploading' | 'success' | 'error', error?: string, mediaId?: string) => void;
  removeUpload: (id: string) => void;
  clearUploads: () => void;
  
  // New fields for moderation
  pendingMedia: Media[];
  approvedMedia: Media[];
  rejectedMedia: Media[];
  selectedMedia: Media | null;
  sortBy: 'newest' | 'oldest' | 'popular';
  filterBy: 'all' | 'photos' | 'videos';
  isUploading: boolean;
  uploadProgress: number;
  
  // New actions for moderation
  setMedia: (media: Media[]) => void;
  setPendingMedia: (media: Media[]) => void;
  setApprovedMedia: (media: Media[]) => void;
  setRejectedMedia: (media: Media[]) => void;
  setSelectedMedia: (media: Media | null) => void;
  setSortBy: (sortBy: 'newest' | 'oldest' | 'popular') => void;
  setFilterBy: (filterBy: 'all' | 'photos' | 'videos') => void;
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  
  // New fetch actions for moderation
  fetchEventPendingMedia: (eventId: string) => Promise<void>;
  fetchEventApprovedMedia: (eventId: string) => Promise<void>;
  fetchEventRejectedMedia: (eventId: string) => Promise<void>;
}

export const useMediaStore = create<MediaState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        media: [],
        currentEventId: null,
        currentMediaId: null,
        currentMedia: null,
        loadingMedia: false,
        loadingMediaError: null,
        
        // Layout and Display Settings
        layout: 'grid',
        sortOption: 'newest',
        filter: {},
        
        // Upload State
        uploads: {},
        
        // New fields for moderation
        pendingMedia: [],
        approvedMedia: [],
        rejectedMedia: [],
        selectedMedia: null,
        sortBy: 'newest',
        filterBy: 'all',
        isUploading: false,
        uploadProgress: 0,
        
        // Actions
        fetchEventMedia: async (eventId, mediaType) => {
          set({ loadingMedia: true, loadingMediaError: null });
          try {
            const media = await getEventMedia(eventId, mediaType);
            set({ media, currentEventId: eventId, loadingMedia: false });
            return media;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch media';
            set({ loadingMedia: false, loadingMediaError: errorMessage });
            return [];
          }
        },
        
        fetchApprovedEventMedia: async (eventId, mediaType) => {
          set({ loadingMedia: true, loadingMediaError: null });
          try {
            const media = await getApprovedEventMedia(eventId, mediaType);
            set({ media, currentEventId: eventId, loadingMedia: false });
            return media;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch approved media';
            set({ loadingMedia: false, loadingMediaError: errorMessage });
            return [];
          }
        },
        
        fetchPendingEventMedia: async (eventId, mediaType) => {
          set({ loadingMedia: true, loadingMediaError: null });
          try {
            const media = await getPendingEventMedia(eventId, mediaType);
            set({ media, currentEventId: eventId, loadingMedia: false });
            return media;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending media';
            set({ loadingMedia: false, loadingMediaError: errorMessage });
            return [];
          }
        },
        
        fetchMediaById: async (mediaId) => {
          set({ loadingMedia: true, loadingMediaError: null });
          try {
            const media = await getMediaById(mediaId);
            set({ 
              currentMedia: media, 
              currentMediaId: mediaId, 
              loadingMedia: false 
            });
            return media;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch media';
            set({ loadingMedia: false, loadingMediaError: errorMessage });
            return null;
          }
        },
        
        approveMedia: async (mediaId) => {
          try {
            await approveMediaItem(mediaId);
            
            // Update local state
            const { pendingMedia, rejectedMedia, approvedMedia } = get();
            
            // Find the media item in pending or rejected arrays
            const pendingItem = pendingMedia.find(item => item.id === mediaId);
            const rejectedItem = rejectedMedia.find(item => item.id === mediaId);
            const mediaItem = pendingItem || rejectedItem;
            
            if (mediaItem) {
              // Update the status
              const updatedItem = { ...mediaItem, status: MediaStatus.APPROVED };
              
              // Add to approved array
              set({ 
                approvedMedia: [...approvedMedia, updatedItem],
                // Remove from pending array if it was there
                pendingMedia: pendingMedia.filter(item => item.id !== mediaId),
                // Remove from rejected array if it was there
                rejectedMedia: rejectedMedia.filter(item => item.id !== mediaId)
              });
            }
            return true;
          } catch (error) {
            console.error('Error approving media:', error);
            return false;
          }
        },
        
        rejectMedia: async (mediaId) => {
          try {
            await rejectMediaItem(mediaId);
            
            // Update local state
            const { pendingMedia, approvedMedia, rejectedMedia } = get();
            
            // Find the media item in pending or approved arrays
            const pendingItem = pendingMedia.find(item => item.id === mediaId);
            const approvedItem = approvedMedia.find(item => item.id === mediaId);
            const mediaItem = pendingItem || approvedItem;
            
            if (mediaItem) {
              // Update the status
              const updatedItem = { ...mediaItem, status: MediaStatus.REJECTED };
              
              // Add to rejected array
              set({ 
                rejectedMedia: [...rejectedMedia, updatedItem],
                // Remove from pending array if it was there
                pendingMedia: pendingMedia.filter(item => item.id !== mediaId),
                // Remove from approved array if it was there
                approvedMedia: approvedMedia.filter(item => item.id !== mediaId)
              });
            }
            return true;
          } catch (error) {
            console.error('Error rejecting media:', error);
            return false;
          }
        },
        
        removeMedia: async (mediaId) => {
          try {
            const success = await deleteMedia(mediaId);
            if (success) {
              // Remove the media from the state
              set((state) => ({
                media: state.media.filter(item => item.id !== mediaId),
                currentMedia: state.currentMedia?.id === mediaId 
                  ? null 
                  : state.currentMedia,
                currentMediaId: state.currentMediaId === mediaId 
                  ? null 
                  : state.currentMediaId
              }));
            }
            return success;
          } catch (error) {
            console.error('Error removing media:', error);
            return false;
          }
        },
        
        getMediaPublicUrl: async (storagePath) => {
          try {
            return await getMediaUrl(storagePath);
          } catch (error) {
            console.error('Error getting media URL:', error);
            return null;
          }
        },
        
        // Layout and Filtering
        setLayout: (layout) => set({ layout }),
        
        setSortOption: (sortOption) => set({ sortOption }),
        
        setFilter: (filter) => set((state) => ({ 
          filter: { ...state.filter, ...filter } 
        })),
        
        clearFilters: () => set({ filter: {} }),
        
        // Upload Management
        addUpload: (file) => {
          const id = `upload-${Date.now()}-${file.name}`;
          set((state) => ({
            uploads: {
              ...state.uploads,
              [id]: {
                file,
                progress: 0,
                status: 'pending'
              }
            }
          }));
          return id;
        },
        
        updateUploadProgress: (id, progress) => {
          set((state) => {
            const upload = state.uploads[id];
            if (!upload) return state;
            
            return {
              uploads: {
                ...state.uploads,
                [id]: {
                  ...upload,
                  progress
                }
              }
            };
          });
        },
        
        setUploadStatus: (id, status, error, mediaId) => {
          set((state) => {
            const upload = state.uploads[id];
            if (!upload) return state;
            
            return {
              uploads: {
                ...state.uploads,
                [id]: {
                  ...upload,
                  status,
                  error,
                  mediaId
                }
              }
            };
          });
        },
        
        removeUpload: (id) => {
          set((state) => {
            const { [id]: _, ...rest } = state.uploads;
            return { uploads: rest };
          });
        },
        
        clearUploads: () => set({ uploads: {} }),
        
        // New actions for moderation
        setMedia: (media) => set({ media }),
        setPendingMedia: (media) => set({ pendingMedia: media }),
        setApprovedMedia: (media) => set({ approvedMedia: media }),
        setRejectedMedia: (media) => set({ rejectedMedia: media }),
        setSelectedMedia: (media) => set({ selectedMedia: media }),
        setSortBy: (sortBy) => set({ sortBy }),
        setFilterBy: (filterBy) => set({ filterBy }),
        setIsUploading: (isUploading) => set({ isUploading }),
        setUploadProgress: (progress) => set({ uploadProgress: progress }),
        
        // New fetch actions for moderation
        fetchEventPendingMedia: async (eventId) => {
          try {
            const media = await getEventPendingMedia(eventId);
            set({ pendingMedia: media });
          } catch (error) {
            console.error('Error fetching pending media:', error);
            throw error;
          }
        },
        
        fetchEventApprovedMedia: async (eventId) => {
          try {
            const media = await getEventApprovedMedia(eventId);
            set({ approvedMedia: media });
          } catch (error) {
            console.error('Error fetching approved media:', error);
            throw error;
          }
        },
        
        fetchEventRejectedMedia: async (eventId) => {
          try {
            const media = await getEventRejectedMedia(eventId);
            set({ rejectedMedia: media });
          } catch (error) {
            console.error('Error fetching rejected media:', error);
            throw error;
          }
        }
      }),
      {
        name: 'media-store',
        partialize: (state) => ({
          layout: state.layout,
          sortOption: state.sortOption,
          filter: state.filter
        })
      }
    )
  )
); 