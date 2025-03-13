import { Photo } from './events'

export interface Gallery {
  id: string
  event_id: string
  settings: GallerySettings
  created_at: string
  updated_at: string
}

export interface GallerySettings {
  layout?: 'grid' | 'masonry' | 'slideshow'
  allowUploads?: boolean
  requireApproval?: boolean
  maxUploadSize?: number
  allowedTypes?: string[]
}

export interface GalleryWithPhotos extends Gallery {
  photos: Photo[]
}

export interface GalleryStats {
  totalPhotos: number
  approvedPhotos: number
  pendingPhotos: number
  totalViews: number
  totalDownloads: number
} 