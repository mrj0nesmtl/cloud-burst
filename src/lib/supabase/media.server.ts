import { createServerClient } from './client';
import { Database } from '@/types/supabase';
import { 
  Media, 
  MediaType,
  MediaMetadata,
  Photo,
  Video
} from '@/types/media';

type MediaRow = Database['public']['Tables']['media']['Row'];

/**
 * Convert a database media row to the Media type used in the application
 */
export function mapDbMediaToMedia(media: MediaRow): Media {
  // Extract metadata or use empty object
  const metadata = media.metadata as MediaMetadata || {};
  
  return {
    id: media.id,
    event_id: media.event_id,
    media_type: media.media_type as MediaType,
    filename: media.filename,
    storage_path: media.storage_path,
    url: media.url || '',
    thumbnail_url: media.thumbnail_url || undefined,
    size: media.size || undefined,
    mime_type: media.mime_type || undefined,
    width: media.width,
    height: media.height,
    duration: media.duration,
    uploaded_by: media.uploaded_by,
    created_at: media.created_at,
    updated_at: media.updated_at || media.created_at,
    is_approved: media.is_approved,
    metadata: metadata
  };
}

/**
 * Convert Media object to a Photo object for backward compatibility
 */
export function mediaToPhoto(media: Media): Photo | null {
  if (media.media_type !== 'photo') return null;
  
  return media as Photo;
}

/**
 * Convert Media object to a Video object
 */
export function mediaToVideo(media: Media): Video | null {
  if (media.media_type !== 'video') return null;
  
  return {
    ...media,
    media_type: 'video',
    duration: media.duration || 0
  } as Video;
}

/**
 * Get all media for an event - SERVER VERSION
 */
export async function getEventMedia(
  eventId: string, 
  mediaType?: MediaType
): Promise<Media[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
}

/**
 * Get all photos for an event (for backward compatibility) - SERVER VERSION
 */
export async function getEventPhotos(eventId: string): Promise<Photo[]> {
  const allMedia = await getEventMedia(eventId, 'photo');
  return allMedia.filter(media => media.media_type === 'photo') as Photo[];
}

/**
 * Get all videos for an event - SERVER VERSION
 */
export async function getEventVideos(eventId: string): Promise<Video[]> {
  const allMedia = await getEventMedia(eventId, 'video');
  return allMedia.filter(media => media.media_type === 'video') as Video[];
}

/**
 * Get approved media for an event - SERVER VERSION
 */
export async function getApprovedEventMedia(
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', true);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching approved event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
}

/**
 * Get pending media for an event - SERVER VERSION
 */
export async function getPendingEventMedia(
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', false);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
}

/**
 * Get all pending media across all events - SERVER VERSION
 */
export async function getAllPendingMedia(mediaType?: MediaType): Promise<Media[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('*, events(name)')
    .eq('is_approved', false);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all pending media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
}

/**
 * Update a media's approval status - SERVER VERSION
 */
export async function updateMediaApproval(mediaId: string, isApproved: boolean): Promise<boolean> {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('media')
    .update({ is_approved: isApproved })
    .eq('id', mediaId);
  
  if (error) {
    console.error('Error updating media approval:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete a media from storage and the database - SERVER VERSION
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  const supabase = await createServerClient();
  
  // First, get the media to find its storage path
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('storage_path, media_type')
    .eq('id', mediaId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching media for deletion:', fetchError);
    return false;
  }
  
  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from('media')
    .remove([media.storage_path]);
  
  if (storageError) {
    console.error('Error deleting media from storage:', storageError);
    return false;
  }
  
  // Delete from database
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);
  
  if (dbError) {
    console.error('Error deleting media from database:', dbError);
    return false;
  }
  
  return true;
}

/**
 * Get a single media by ID - SERVER VERSION
 */
export async function getMediaById(mediaId: string): Promise<Media | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', mediaId)
    .single();
  
  if (error) {
    console.error('Error fetching media:', error);
    return null;
  }
  
  return mapDbMediaToMedia(data);
}

/**
 * Get a single photo by ID (for backward compatibility) - SERVER VERSION
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const media = await getMediaById(photoId);
  if (!media || media.media_type !== 'photo') return null;
  return media as Photo;
}

/**
 * Count total media for an event - SERVER VERSION
 */
export async function countEventMedia(
  eventId: string,
  mediaType?: MediaType
): Promise<number> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('id', { count: 'exact' })
    .eq('event_id', eventId);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { count, error } = await query;
  
  if (error) {
    console.error('Error counting event media:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Count pending media for an event - SERVER VERSION
 */
export async function countPendingEventMedia(
  eventId: string,
  mediaType?: MediaType
): Promise<number> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('id', { count: 'exact' })
    .eq('event_id', eventId)
    .eq('is_approved', false);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { count, error } = await query;
  
  if (error) {
    console.error('Error counting pending event media:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Get recent media uploads - SERVER VERSION
 */
export async function getRecentMedia(
  limit: number = 10,
  mediaType?: MediaType
): Promise<Media[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching recent media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
}

/**
 * Get recent media uploads for an event - SERVER VERSION
 */
export async function getRecentEventMedia(
  eventId: string,
  limit: number = 10,
  mediaType?: MediaType
): Promise<Media[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching recent event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
} 