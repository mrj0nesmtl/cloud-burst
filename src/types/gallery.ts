import { Photo } from './events'

export interface Gallery {
  id: string
  name?: string
  description?: string
  event_id: string
  organizer_id: string
  created_at: string
  updated_at: string
  status: 'active' | 'archived' | 'pending'
  settings: GallerySettings
  thumbnail_url?: string | null
  events?: {
    name: string
    date: string
    status: string
  }
}

export interface GallerySettings {
  layout?: 'grid' | 'masonry' | 'slideshow'
  allowUploads?: boolean
  requireApproval?: boolean
  maxUploadSize?: number
  allowedTypes?: string[]
  useLogoAsThumbnail?: boolean
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