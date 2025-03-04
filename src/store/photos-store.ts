import { create } from 'zustand'
import { Photo } from '@/types/events'
import { 
  getPhotoUrl,
  uploadAndCreatePhotoWithTags
} from '@/app/lib/photos-client'

interface PhotosState {
  // Photos data
  eventPhotos: Photo[]
  approvedPhotos: Photo[]
  pendingPhotos: Photo[]
  userPhotos: Photo[]
  currentPhoto: Photo | null
  
  // Loading states
  isLoadingEventPhotos: boolean
  isLoadingApprovedPhotos: boolean
  isLoadingPendingPhotos: boolean
  isLoadingUserPhotos: boolean
  
  // Upload states
  isUploading: boolean
  uploadProgress: number
  uploadError: Error | null
  
  // Error states
  eventPhotosError: Error | null
  approvedPhotosError: Error | null
  pendingPhotosError: Error | null
  userPhotosError: Error | null
  
  // Actions
  fetchEventPhotos: (eventId: string) => Promise<void>
  fetchApprovedEventPhotos: (eventId: string) => Promise<void>
  fetchPendingEventPhotos: (eventId: string) => Promise<void>
  fetchUserPhotos: () => Promise<void>
  setCurrentPhoto: (photo: Photo | null) => void
  getPhotoPublicUrl: (photo: Photo) => string
  setUploadProgress: (progress: number) => void
  setIsUploading: (isUploading: boolean) => void
  setUploadError: (error: Error | null) => void
  clearErrors: () => void
}

export const usePhotosStore = create<PhotosState>((set, get) => ({
  // Initial state
  eventPhotos: [],
  approvedPhotos: [],
  pendingPhotos: [],
  userPhotos: [],
  currentPhoto: null,
  
  isLoadingEventPhotos: false,
  isLoadingApprovedPhotos: false,
  isLoadingPendingPhotos: false,
  isLoadingUserPhotos: false,
  
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,
  
  eventPhotosError: null,
  approvedPhotosError: null,
  pendingPhotosError: null,
  userPhotosError: null,
  
  // Fetch all photos for an event
  fetchEventPhotos: async (eventId: string) => {
    set({ isLoadingEventPhotos: true, eventPhotosError: null })
    
    try {
      // Use fetch API instead of server function
      const response = await fetch(`/api/events/${eventId}/photos`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch event photos: ${response.statusText}`)
      }
      
      const photos = await response.json()
      set({ eventPhotos: photos, isLoadingEventPhotos: false })
    } catch (error) {
      console.error('Error fetching event photos:', error)
      set({ 
        eventPhotosError: error instanceof Error ? error : new Error('Failed to fetch event photos'), 
        isLoadingEventPhotos: false 
      })
    }
  },
  
  // Fetch approved photos for an event
  fetchApprovedEventPhotos: async (eventId: string) => {
    set({ isLoadingApprovedPhotos: true, approvedPhotosError: null })
    
    try {
      // Use fetch API instead of server function
      const response = await fetch(`/api/events/${eventId}/photos/approved`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch approved photos: ${response.statusText}`)
      }
      
      const photos = await response.json()
      set({ approvedPhotos: photos, isLoadingApprovedPhotos: false })
    } catch (error) {
      console.error('Error fetching approved photos:', error)
      set({ 
        approvedPhotosError: error instanceof Error ? error : new Error('Failed to fetch approved photos'), 
        isLoadingApprovedPhotos: false 
      })
    }
  },
  
  // Fetch pending photos for an event
  fetchPendingEventPhotos: async (eventId: string) => {
    set({ isLoadingPendingPhotos: true, pendingPhotosError: null })
    
    try {
      // Use fetch API instead of server function
      const response = await fetch(`/api/events/${eventId}/photos/pending`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending photos: ${response.statusText}`)
      }
      
      const photos = await response.json()
      set({ pendingPhotos: photos, isLoadingPendingPhotos: false })
    } catch (error) {
      console.error('Error fetching pending photos:', error)
      set({ 
        pendingPhotosError: error instanceof Error ? error : new Error('Failed to fetch pending photos'), 
        isLoadingPendingPhotos: false 
      })
    }
  },
  
  // Fetch photos uploaded by the current user
  fetchUserPhotos: async () => {
    set({ isLoadingUserPhotos: true, userPhotosError: null })
    
    try {
      // Use fetch API instead of server function
      const response = await fetch(`/api/user/photos`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user photos: ${response.statusText}`)
      }
      
      const photos = await response.json()
      set({ userPhotos: photos, isLoadingUserPhotos: false })
    } catch (error) {
      console.error('Error fetching user photos:', error)
      set({ 
        userPhotosError: error instanceof Error ? error : new Error('Failed to fetch user photos'), 
        isLoadingUserPhotos: false 
      })
    }
  },
  
  // Set the current photo
  setCurrentPhoto: (photo: Photo | null) => {
    set({ currentPhoto: photo })
  },
  
  // Get the public URL for a photo
  getPhotoPublicUrl: (photo: Photo) => {
    return getPhotoUrl(photo)
  },
  
  // Set upload progress
  setUploadProgress: (progress: number) => {
    set({ uploadProgress: progress })
  },
  
  // Set uploading state
  setIsUploading: (isUploading: boolean) => {
    set({ isUploading, uploadProgress: isUploading ? 0 : 100 })
  },
  
  // Set upload error
  setUploadError: (error: Error | null) => {
    set({ uploadError: error })
  },
  
  // Clear all errors
  clearErrors: () => {
    set({ 
      eventPhotosError: null,
      approvedPhotosError: null,
      pendingPhotosError: null,
      userPhotosError: null,
      uploadError: null
    })
  }
})) 