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
 * Media type enum
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
 * Media interface for both photos and videos
 * Matches the database schema
 */
export interface Media {
  id: string;
  event_id: string;
  uploaded_by: string;  // This is user_id in our code but uploaded_by in DB
  media_type: MediaType;
  storage_path: string; // This is file_path in our code but storage_path in DB
  filename: string;
  url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  description?: string | null;
  size?: number | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  is_approved?: boolean | null;
  status?: MediaStatus;
  is_public?: boolean | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Photo specific interface (for backward compatibility)
 */
export interface Photo extends Omit<Media, 'media_type'> {
  media_type: MediaType.PHOTO;
}

/**
 * Video specific interface
 */
export interface Video extends Omit<Media, 'media_type' | 'duration'> {
  media_type: MediaType.VIDEO;
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
 * Parameters for creating a new media item
 * Uses our application naming conventions
 */
export interface CreateMediaParams {
  eventId: string;
  userId: string; // will map to uploaded_by
  mediaType: MediaType;
  filePath: string; // will map to storage_path
  filename: string;
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
  mimeType?: string;
  isPublic?: boolean;
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
    event_id: dbMedia.event_id || '',
    uploaded_by: dbMedia.uploaded_by || '',
    media_type: dbMedia.media_type as MediaType,
    storage_path: dbMedia.storage_path || '',
    filename: dbMedia.filename,
    url: dbMedia.url || '',
    thumbnail_url: dbMedia.thumbnail_url,
    title: dbMedia.title,
    description: dbMedia.description,
    size: dbMedia.size,
    mime_type: dbMedia.mime_type,
    width: dbMedia.width,
    height: dbMedia.height,
    duration: dbMedia.duration,
    is_approved: isApproved,
    status: status,
    is_public: dbMedia.is_public,
    metadata: metadata,
    created_at: dbMedia.created_at || new Date().toISOString(),
    updated_at: dbMedia.updated_at || new Date().toISOString(),
  };
} 