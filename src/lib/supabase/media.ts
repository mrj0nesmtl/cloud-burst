import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { 
  Media, 
  MediaType,
  MediaMetadata, 
  Photo, 
  Video,
  CreateMediaParams,
  UpdateMediaParams,
  MediaStatus
} from '@/types/media';
import { createClient } from '@/lib/supabase/client';

type MediaInsert = Database['public']['Tables']['media']['Insert'];
type MediaUpdate = Database['public']['Tables']['media']['Update'];
type MediaRow = Database['public']['Tables']['media']['Row'];

/**
 * Map a database media record to the Media type
 */
export function mapDbMediaToMedia(dbMedia: any): Media {
  const metadata = dbMedia.metadata || {};
  
  // Determine status based on available fields
  let status = dbMedia.status as MediaStatus;
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
  // Default to PENDING if neither is available
  else {
    status = MediaStatus.PENDING;
    isApproved = false;
  }

  return {
    id: dbMedia.id,
    event_id: dbMedia.event_id,
    media_type: dbMedia.media_type as MediaType,
    storage_path: dbMedia.storage_path,
    file_path: dbMedia.file_path,
    url: dbMedia.url,
    thumbnail_url: dbMedia.thumbnail_url,
    title: dbMedia.title,
    description: dbMedia.description,
    size: dbMedia.size,
    mime_type: dbMedia.mime_type,
    width: dbMedia.width || metadata.width,
    height: dbMedia.height || metadata.height,
    duration: dbMedia.duration,
    user_id: dbMedia.user_id,
    is_approved: isApproved,
    status: status,
    created_at: dbMedia.created_at,
    updated_at: dbMedia.updated_at,
    metadata: metadata
  };
}

/**
 * Convert Media object to a Photo object for backward compatibility
 */
export function mediaToPhoto(media: Media): Photo | null {
  if (media.media_type !== MediaType.PHOTO) return null;
  
  return media as Photo;
}

/**
 * Convert Media object to a Video object
 */
export function mediaToVideo(media: Media): Video | null {
  if (media.media_type !== MediaType.VIDEO) return null;
  
  return media as Video;
}

/**
 * Upload and create a photo
 */
export async function uploadAndCreatePhoto(
  file: File,
  eventId: string,
  userId: string,
  metadata: MediaMetadata = {}
): Promise<Media | null> {
  return uploadAndCreateMedia(file, eventId, userId, MediaType.PHOTO, metadata);
}

/**
 * Upload and create a video
 */
export async function uploadAndCreateVideo(
  file: File,
  eventId: string,
  userId: string,
  duration: number,
  metadata: MediaMetadata = {}
): Promise<Media | null> {
  return uploadAndCreateMedia(file, eventId, userId, MediaType.VIDEO, {
    ...metadata,
    duration
  });
}

/**
 * Upload and create a media item (photo or video)
 */
export async function uploadAndCreateMedia(
  file: File,
  eventId: string,
  userId: string,
  mediaType: MediaType = MediaType.PHOTO,
  metadata: MediaMetadata = {}
): Promise<Media | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Generate a unique filename
  const timestamp = new Date().getTime();
  const fileExt = file.name.split('.').pop();
  const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const storagePath = `events/${eventId}/${mediaType}s/${safeFileName}`;
  
  // Upload the file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('media')
    .upload(storagePath, file);
  
  if (uploadError) {
    console.error('Error uploading media:', uploadError);
    return null;
  }
  
  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase
    .storage
    .from('media')
    .getPublicUrl(storagePath);
  
  // Get dimensions for image files
  let width: number | null = null;
  let height: number | null = null;
  let duration: number | null = null;
  
  if (mediaType === MediaType.PHOTO && file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      console.warn('Could not get image dimensions:', error);
    }
  } else if (mediaType === MediaType.VIDEO && file.type.startsWith('video/')) {
    duration = metadata.duration || null;
  }
  
  // Create a record in the media table
  const mediaRecord: MediaInsert = {
    event_id: eventId,
    media_type: mediaType,
    storage_path: storagePath,
    file_path: file.name,
    url: publicUrl,
    size: file.size,
    mime_type: file.type,
    width,
    height,
    duration,
    user_id: userId,
    status: MediaStatus.PENDING,
    metadata: metadata,
  };
  
  const { data: mediaData, error: mediaError } = await supabase
    .from('media')
    .insert(mediaRecord)
    .select()
    .single();
  
  if (mediaError) {
    console.error('Error creating media record:', mediaError);
    return null;
  }
  
  return mapDbMediaToMedia(mediaData);
}

/**
 * Upload a photo with tags to Supabase Storage and create a record in the media table
 */
export async function uploadAndCreatePhotoWithTags(
  file: File,
  eventId: string,
  userId: string,
  tags: string[] = []
): Promise<Media | null> {
  const metadata: MediaMetadata = {
    tags: tags,
  };
  
  return uploadAndCreatePhoto(file, eventId, userId, metadata);
}

/**
 * Get image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Get all media for an event
 */
export async function getEventMedia(
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> {
  const supabase = createClient();
  
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
  
  return (data || []).map(mapDbMediaToMedia);
}

/**
 * Get event photos
 */
export async function getEventPhotos(eventId: string): Promise<Photo[]> {
  const allMedia = await getEventMedia(eventId, MediaType.PHOTO);
  return allMedia.filter(media => media.media_type === MediaType.PHOTO) as Photo[];
}

/**
 * Get event videos
 */
export async function getEventVideos(eventId: string): Promise<Video[]> {
  const allMedia = await getEventMedia(eventId, MediaType.VIDEO);
  return allMedia.filter(media => media.media_type === MediaType.VIDEO) as Video[];
}

/**
 * Get a single media item by ID - CLIENT VERSION
 */
export async function getMediaById(mediaId: string): Promise<Media | null> {
  const supabase = createClientComponentClient<Database>();
  
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
 * Get a single photo by ID (for backward compatibility)
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const media = await getMediaById(photoId);
  if (!media || media.media_type !== 'photo') return null;
  return media as Photo;
}

/**
 * Update a media's approval status - CLIENT VERSION
 */
export async function updateMediaApproval(mediaId: string, isApproved: boolean): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  const { error } = await supabase
    .from('media')
    .update({ is_approved: isApproved } as MediaUpdate)
    .eq('id', mediaId);
  
  if (error) {
    console.error('Error updating media approval:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete a media from storage and the database - CLIENT VERSION
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
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
 * Add a tag to a media - CLIENT VERSION
 */
export async function addTagToMedia(mediaId: string, tag: string): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  // First, get the current media metadata
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('metadata')
    .eq('id', mediaId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching media metadata:', fetchError);
    return false;
  }
  
  // Update the metadata with the new tag
  const metadata = media.metadata as MediaMetadata || {};
  const tags = metadata.tags || [];
  
  if (!tags.includes(tag)) {
    tags.push(tag);
  }
  
  const updatedMetadata: MediaMetadata = {
    ...metadata,
    tags,
  };
  
  // Update the media record
  const { error: updateError } = await supabase
    .from('media')
    .update({ metadata: updatedMetadata } as MediaUpdate)
    .eq('id', mediaId);
  
  if (updateError) {
    console.error('Error updating media tags:', updateError);
    return false;
  }
  
  return true;
}

/**
 * Remove a tag from a media - CLIENT VERSION
 */
export async function removeTagFromMedia(mediaId: string, tag: string): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  // First, get the current media metadata
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('metadata')
    .eq('id', mediaId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching media metadata:', fetchError);
    return false;
  }
  
  // Update the metadata by removing the tag
  const metadata = media.metadata as MediaMetadata || {};
  const tags = metadata.tags || [];
  
  const updatedTags = tags.filter(t => t !== tag);
  
  const updatedMetadata: MediaMetadata = {
    ...metadata,
    tags: updatedTags,
  };
  
  // Update the media record
  const { error: updateError } = await supabase
    .from('media')
    .update({ metadata: updatedMetadata } as MediaUpdate)
    .eq('id', mediaId);
  
  if (updateError) {
    console.error('Error updating media tags:', updateError);
    return false;
  }
  
  return true;
}

/**
 * Get approved media for an event - CLIENT VERSION
 */
export const getApprovedEventMedia = async (
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> => {
  const supabase = createClientComponentClient<Database>();
  
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
};

/**
 * Get pending media for an event - CLIENT VERSION
 */
export const getPendingEventMedia = async (
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> => {
  const supabase = createClientComponentClient<Database>();
  
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
};

/**
 * Get media uploaded by a user - CLIENT VERSION
 */
export const getUserMedia = async (
  userId: string,
  mediaType?: MediaType
): Promise<Media[]> => {
  const supabase = createClientComponentClient<Database>();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('uploaded_by', userId);
    
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
};

/**
 * Get a public URL for a media storage path - CLIENT VERSION
 */
export const getMediaUrl = async (storagePath: string): Promise<string | null> => {
  const supabase = createClientComponentClient<Database>();
  
  const { data } = supabase
    .storage
    .from('media')
    .getPublicUrl(storagePath);
  
  return data.publicUrl;
};

/**
 * Get pending media for an event
 */
export const getEventPendingMedia = async (
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> => {
  const supabase = createClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', MediaStatus.PENDING)
    .order('created_at', { ascending: false });
  
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching pending event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
};

/**
 * Get approved media for an event
 */
export const getEventApprovedMedia = async (
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> => {
  const supabase = createClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', MediaStatus.APPROVED)
    .order('created_at', { ascending: false });
  
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching approved event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
};

/**
 * Get rejected media for an event
 */
export const getEventRejectedMedia = async (
  eventId: string,
  mediaType?: MediaType
): Promise<Media[]> => {
  const supabase = createClient();
  
  let query = supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', MediaStatus.REJECTED)
    .order('created_at', { ascending: false });
  
  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching rejected event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
};

/**
 * Approve a media item
 */
export const approveMediaItem = async (mediaId: string): Promise<boolean> => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('media')
    .update({
      status: MediaStatus.APPROVED,
      updated_at: new Date().toISOString()
    })
    .eq('id', mediaId);
  
  if (error) {
    console.error('Error approving media:', error);
    return false;
  }
  
  return true;
};

/**
 * Reject a media item
 */
export const rejectMediaItem = async (mediaId: string): Promise<boolean> => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('media')
    .update({
      status: MediaStatus.REJECTED,
      updated_at: new Date().toISOString()
    })
    .eq('id', mediaId);
  
  if (error) {
    console.error('Error rejecting media:', error);
    return false;
  }
  
  return true;
};