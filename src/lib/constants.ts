/**
 * Constants used throughout the application
 */

// Default settings for galleries
export const DEFAULT_GALLERY_SETTINGS = {
  layout: 'grid',
  allowUploads: true,
  requireApproval: true,
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowGuestUploads: true,
  showPhotographerInfo: true,
  allowDownloads: true,
  allowLikes: true,
  allowComments: false,
  sortBy: 'uploadedAt', // Options: uploadedAt, likes, createdAt
  sortDirection: 'desc', // Options: asc, desc
}

// Event status options
export const EVENT_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

// Media status options
export const MEDIA_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]

// Gallery layout options
export const GALLERY_LAYOUT_OPTIONS = [
  { label: 'Grid', value: 'grid' },
  { label: 'Masonry', value: 'masonry' },
  { label: 'Carousel', value: 'carousel' }
]

// Display error duration in ms
export const ERROR_TOAST_DURATION = 8000

// Display success duration in ms
export const SUCCESS_TOAST_DURATION = 5000

// Max file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime'
]

// Default pagination limits
export const DEFAULT_PAGINATION_LIMIT = 20 