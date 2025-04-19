/**
 * Types for the Cloud Burst media system
 * Supports both photos and videos
 */
import { Event } from './events';
import { UserProfile } from './auth';
import { Database } from './supabase'
import { Json } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Media types enum
 */
export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video'
}

/**
 * Media status enum
 */
export enum MediaStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

/**
 * Media layout enum
 */
export enum MediaLayout {
  GRID = 'grid',
  MASONRY = 'masonry',
  CAROUSEL = 'carousel',
}

/**
 * Gallery sort options
 */
export enum GallerySortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  POPULAR = 'popular',
}

/**
 * Media interface representing a media item
 */
export interface Media {
  id: string;
  eventId: string;
  mediaType: MediaType;
  storagePath: string;
  filename: string;
  originalFilename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width: number | null;
  height: number | null;
  title?: string;
  description?: string;
  isPublic: boolean;
  status: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Photo specific interface (for backward compatibility)
 */
export interface Photo extends Omit<Media, 'mediaType'> {
  mediaType: MediaType.PHOTO;
}

/**
 * Video specific interface
 */
export interface Video extends Omit<Media, 'mediaType' | 'duration'> {
  mediaType: MediaType.VIDEO;
  duration: number; // in seconds
}

/**
 * Media with related event data
 */
export interface MediaWithEvent extends Media {
  event: Event;
}

/**
 * Media with uploader information
 */
export interface MediaWithUploader extends Media {
  uploader: UserProfile | null;
}

/**
 * Media creation parameters
 */
export interface CreateMediaParams {
  eventId: string;
  mediaType: MediaType;
  storagePath: string;
  filename: string;
  originalFilename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  contentType: string;
  width?: number | null;
  height?: number | null;
  title?: string;
  description?: string;
  isPublic?: boolean;
  status?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for updating a media item
 */
export interface UpdateMediaParams {
  id: string;
  title?: string;
  description?: string;
  status?: MediaStatus;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Media metadata interface
 */
export interface MediaMetadata {
  tags?: string[];
  caption?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
  camera?: {
    make?: string;
    model?: string;
  };
  // Video-specific metadata
  video?: {
    framerate?: number;
    codec?: string;
    bitrate?: number;
    resolution?: string;
  };
  [key: string]: any;
}

/**
 * Album interface
 */
export interface Album {
  id: string;
  event_id: string;
  title: string;
  description?: string | null;
  cover_media_id?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  media_count?: number;
  cover_url?: string;
}

/**
 * AlbumMedia join table interface
 */
export interface AlbumMedia {
  id: string;
  album_id: string;
  media_id: string;
  sort_order: number;
  created_at: string;
}

/**
 * Parameters for creating a new album
 */
export interface CreateAlbumParams {
  eventId: string;
  title: string;
  description?: string;
  coverMediaId?: string;
  isPublic?: boolean;
}

/**
 * Parameters for updating an album
 */
export interface UpdateAlbumParams {
  id: string;
  title?: string;
  description?: string;
  coverMediaId?: string;
  isPublic?: boolean;
}

/**
 * Gallery layout options
 */
export type GalleryLayout = 'grid' | 'masonry' | 'carousel' | 'filmstrip'

/**
 * Gallery filter interface
 */
export interface GalleryFilter {
  mediaType?: MediaType;
  status?: MediaStatus;
  userId?: string;
  albumId?: string;
  search?: string;
}

/**
 * Media upload progress interface
 */
export interface MediaUploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

/**
 * Moderation log interface
 */
export interface ModerationLog {
  id: string;
  media_id: string;
  user_id: string;
  action: 'approve' | 'reject' | 'delete';
  reason?: string;
  created_at: string;
  media?: Media;
  user?: UserProfile;
}

/**
 * Database types to ensure type safety with Supabase
 * Note: We use type assertions since the tables might not be reflected in the types yet
 */
export type DbMedia = Database['public']['Tables']['media']['Row'];
// Remove these type references until we regenerate the types
// export type DbAlbum = Database['public']['Tables']['albums']['Row'];
// export type DbAlbumMedia = Database['public']['Tables']['album_media']['Row'];
// export type DbModerationLog = Database['public']['Tables']['moderation_logs']['Row'];

/**
 * Sanitize user input to prevent XSS attacks
 */
export function isPhoto(media: Media): boolean {
  return media.mediaType === MediaType.PHOTO;
}

/**
 * Helper function to check if media is a video
 */
export function isVideo(media: Media): boolean {
  return media.mediaType === MediaType.VIDEO;
}

export type MediaUploadResult = {
  path: string;
  url: string;
};

export interface MediaServiceClient {
  supabase: SupabaseClient<Database>;
  getEventMedia: (eventId: string) => Promise<Media[]>;
  getApprovedEventMedia: (eventId: string) => Promise<Media[]>;
  getPendingEventMedia: (eventId: string) => Promise<Media[]>;
  getRejectedEventMedia: (eventId: string) => Promise<Media[]>;
  getUserMedia: (userId?: string) => Promise<Media[]>;
  getMediaById: (mediaId: string) => Promise<Media | null>;
  createMedia: (params: CreateMediaParams) => Promise<Media | null>;
  updateMedia: (params: UpdateMediaParams) => Promise<Media | null>;
  deleteMedia: (mediaId: string) => Promise<boolean>;
  uploadMedia: (file: File, eventId: string, onProgress?: (progress: number) => void) => Promise<MediaUploadResult | null>;
  approveMedia: (mediaId: string, reason?: string) => Promise<Media | null>;
  rejectMedia: (mediaId: string, reason?: string) => Promise<Media | null>;

  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\$/g, '&#36;');
}

/**
 * Helper function to map database media to our application Media type
 */
export function mapDbMediaToMedia(dbMedia: any): Media {
  const metadata = dbMedia.metadata || {};
  
  // Determine status based on available fields
  let status = dbMedia.status as MediaStatus || MediaStatus.PENDING;
  let isApproved = dbMedia.is_approved;
  
  // If status is available, use it
  if (status) {
    // Set is_approved for backward compatibility
    isApproved = status === MediaStatus.APPROVED;
  } 
  // If only is_approved is available, derive status from it
  else if (isApproved !== undefined) {
    status = isApproved ? MediaStatus.APPROVED : MediaStatus.PENDING;
  }
  
  return {
    id: dbMedia.id,
    eventId: dbMedia.event_id || '',
    mediaType: dbMedia.media_type as MediaType,
    storagePath: dbMedia.storage_path || '',
    filename: dbMedia.filename,
    originalFilename: dbMedia.filename,
    url: dbMedia.url || '',
    thumbnailUrl: dbMedia.thumbnail_url,

    size: dbMedia.size,
    width: dbMedia.width,
    height: dbMedia.height,
    title: dbMedia.title,
    description: dbMedia.description,
    isPublic: dbMedia.is_public,
    status: dbMedia.status,
    metadata: metadata,
    createdAt: dbMedia.created_at || new Date().toISOString(),
    updatedAt: dbMedia.updated_at,
  };
}

/**
 * Helper function to check if media is a photo
 */
export function isPhoto(media: Media): boolean {
  return media.media_type === MediaType.PHOTO;
}

/**
 * Helper function to check if media is a video
 */
export function isVideo(media: Media): boolean {
  return media.media_type === MediaType.VIDEO;
}

export type MediaUploadResult = {
  path: string;
  url: string;
};

export interface MediaServiceClient {
  supabase: SupabaseClient<Database>;
  getEventMedia: (eventId: string) => Promise<Media[]>;
  getApprovedEventMedia: (eventId: string) => Promise<Media[]>;
  getPendingEventMedia: (eventId: string) => Promise<Media[]>;
  getRejectedEventMedia: (eventId: string) => Promise<Media[]>;
  getUserMedia: (userId?: string) => Promise<Media[]>;
  getMediaById: (mediaId: string) => Promise<Media | null>;
  createMedia: (params: CreateMediaParams) => Promise<Media | null>;
  updateMedia: (params: UpdateMediaParams) => Promise<Media | null>;
  deleteMedia: (mediaId: string) => Promise<boolean>;
  uploadMedia: (file: File, eventId: string, onProgress?: (progress: number) => void) => Promise<MediaUploadResult | null>;
  approveMedia: (mediaId: string, reason?: string) => Promise<Media | null>;
  rejectMedia: (mediaId: string, reason?: string) => Promise<Media | null>;
  
  // Album methods
  getEventAlbums: (eventId: string) => Promise<Album[]>;
  getAlbumById: (albumId: string) => Promise<Album | null>;
  getAlbumMedia: (albumId: string) => Promise<Media[]>;
  createAlbum: (params: CreateAlbumParams) => Promise<Album | null>;
  updateAlbum: (params: UpdateAlbumParams) => Promise<Album | null>;
  deleteAlbum: (albumId: string) => Promise<boolean>;
  addMediaToAlbum: (albumId: string, mediaId: string) => Promise<boolean>;
  removeMediaFromAlbum: (albumId: string, mediaId: string) => Promise<boolean>;
  reorderAlbumMedia: (albumId: string, mediaIds: string[]) => Promise<boolean>;
} 