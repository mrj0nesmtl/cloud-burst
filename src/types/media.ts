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
  mediaType?: string;
  storagePath?: string;
  filename?: string;
  originalFilename?: string;
  url: string;
  thumbnailUrl?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
  title?: string;
  description?: string;
  isPublic?: boolean;
  status?: string;
  metadata?: Record<string, any>;
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
// Define our own DbMedia type since it seems to be missing from the Database types
export interface DbMedia {
  id: string;
  event_id: string;
  media_type: string;
  storage_path: string;
  filename: string;
  original_filename: string;
  url: string;
  thumbnail_url?: string | null;
  size: number;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  description?: string | null;
  is_public: boolean;
  status: string;
  metadata?: Json;
  created_at: string;
  updated_at?: string | null;
  uploaded_by?: string | null;
}
// Remove these type references until we regenerate the types
// export type DbAlbum = Database['public']['Tables']['albums']['Row'];

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

// Remove everything below this line and end the file here
// export type MediaUploadResult = {
//   path: string;
//   url: string;
// };
// 
// export interface MediaServiceClient {
//   ...
// } 