/**
 * Types for the Cloud Burst media system
 * Supports both photos and videos
 */
import { Event } from './events';
import { UserProfile } from './auth';
import { Database } from './supabase'
import { Json } from '@/types/supabase';

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
 * Media interface for both photos and videos
 */
export interface Media {
  id: string;
  event_id: string;
  media_type: MediaType;
  storage_path: string;
  file_path: string;
  url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  description?: string | null;
  size?: number | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  user_id?: string | null;
  // Backward compatibility
  is_approved?: boolean;
  status: MediaStatus;
  metadata?: Json | null;
  created_at: string;
  updated_at?: string | null;
  event?: Event;
}

/**
 * Photo specific interface (for backward compatibility)
 */
export interface Photo extends Omit<Media, 'media_type'> {
  media_type: 'photo';
}

/**
 * Video specific interface
 */
export interface Video extends Omit<Media, 'media_type' | 'duration'> {
  media_type: 'video';
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
 */
export interface CreateMediaParams {
  eventId: string
  userId: string
  mediaType: MediaType
  filePath: string
  url: string
  title?: string
  description?: string
  size?: number
}

/**
 * Parameters for updating a media item
 */
export interface UpdateMediaParams {
  id: string
  title?: string
  description?: string
  status?: MediaStatus
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
  [key: string]: any;
}

/**
 * Album interface
 */
export interface Album {
  id: string;
  name: string;
  description?: string;
  event_id: string;
  cover_media_id?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  media_count?: number;
  cover_media?: Media;
}

/**
 * AlbumMedia join table interface
 */
export interface AlbumMedia {
  id: string;
  album_id: string;
  media_id: string;
  display_order: number;
  created_at: string;
}

/**
 * Parameters for creating a new album
 */
export interface CreateAlbumParams {
  name: string;
  description?: string;
  event_id: string;
  cover_media_id?: string;
  is_public?: boolean;
}

/**
 * Parameters for updating an album
 */
export interface UpdateAlbumParams {
  name?: string;
  description?: string;
  cover_media_id?: string;
  is_public?: boolean;
}

/**
 * Gallery layout options
 */
export type GalleryLayout = 'grid' | 'masonry' | 'carousel' | 'filmstrip'

/**
 * Gallery sort options
 */
export type GallerySortOption = 'newest' | 'oldest' | 'popular' | 'name_asc' | 'name_desc' | 'size_asc' | 'size_desc'

/**
 * Gallery filter interface
 */
export type GalleryFilter = 'all' | 'photos' | 'videos'

/**
 * Media upload progress interface
 */
export interface MediaUploadProgress {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
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