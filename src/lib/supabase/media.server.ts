import { createClient } from '@/lib/supabase/server';
import { 
  Media, 
  MediaType, 
  MediaStatus, 
  CreateMediaParams, 
  UpdateMediaParams,
  Album,
  CreateAlbumParams,
  UpdateAlbumParams,
  MediaServiceClient
} from '@/types/media';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a function to get the server supabase client
// This version supports both request contexts (with cookies) and non-request contexts
function getServerClient(cookieStore?: ReturnType<typeof cookies>): SupabaseClient<Database> {
  try {
    // If we're in a context without cookies, use createClient() which will use anon client
    return createClient();
  } catch (error) {
    console.error('Error creating server client:', error);
    // Fallback to anonymous client
    return createClient();
  }
}

/**
 * Get all media for an event
 */
export async function getEventMedia(eventId: string): Promise<Media[]> {
  const supabase = getServerClient();
  
  // Use RLS policies to ensure users only see media they have access to
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching event media:', error);
    throw error;
  }
  
  return data as Media[];
}

/**
 * Get approved media for an event
 */
export async function getApprovedEventMedia(eventId: string): Promise<Media[]> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', MediaStatus.APPROVED)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching approved event media:', error);
    throw error;
  }
  
  return data as Media[];
}

/**
 * Get pending media for an event
 */
export async function getPendingEventMedia(eventId: string): Promise<Media[]> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', MediaStatus.PENDING)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending event media:', error);
    throw error;
  }
  
  return data as Media[];
}

/**
 * Get rejected media for an event
 */
export async function getRejectedEventMedia(eventId: string): Promise<Media[]> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', MediaStatus.REJECTED)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching rejected event media:', error);
    throw error;
  }
  
  return data as Media[];
}

/**
 * Get media owned by a specific user
 */
export async function getUserMedia(userId?: string): Promise<Media[]> {
  const supabase = getServerClient();
  
  // If no userId provided, return empty array
  if (!userId) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user media:', error);
    throw error;
  }
  
  return data as Media[];
}

/**
 * Get a single media item by ID
 */
export async function getMediaById(mediaId: string): Promise<Media | null> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', mediaId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned
      return null;
    }
    
    console.error('Error fetching media by ID:', error);
    throw error;
  }
  
  return data as Media;
}

/**
 * Create a new media record
 */
export async function createMedia(params: CreateMediaParams): Promise<Media | null> {
  const supabase = getServerClient();
  
  const {
    eventId,
    userId,
    mediaType,
    filePath,
    url,
    title,
    description,
    thumbnailUrl,
    size,
    width,
    height,
    duration,
    metadata,
    mimeType,
    isPublic = false,
    filename,
  } = params;
  
  const { data, error } = await supabase
    .from('media')
    .insert({
      event_id: eventId,
      uploaded_by: userId,
      media_type: mediaType,
      storage_path: filePath,
      url,
      thumbnail_url: thumbnailUrl,
      title,
      description,
      size,
      width,
      height,
      duration,
      metadata,
      mime_type: mimeType,
      is_public: isPublic,
      status: MediaStatus.PENDING, // Default status is pending
      filename,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating media:', error);
    throw error;
  }
  
  return data as Media;
}

/**
 * Update a media record
 */
export async function updateMedia(params: UpdateMediaParams): Promise<Media | null> {
  const supabase = getServerClient();
  
  const { id, title, description, status, isPublic, metadata } = params;
  
  const { data, error } = await supabase
    .from('media')
    .update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(isPublic !== undefined && { is_public: isPublic }),
      ...(metadata !== undefined && { metadata }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating media:', error);
    throw error;
  }
  
  return data as Media;
}

/**
 * Delete a media record and its file
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  const supabase = getServerClient();
  
  // First, get the media record to get the file path
  const mediaRecord = await getMediaById(mediaId);
  
  if (!mediaRecord) {
    console.error('Media not found:', mediaId);
    return false;
  }
  
  // Then, delete the actual file from storage
  try {
    await supabase
      .storage
      .from('media')
      .remove([mediaRecord.storage_path]);
  } catch (storageError) {
    console.error('Error deleting media file:', storageError);
    // Continue anyway to delete the DB record
  }
  
  // Finally, delete the database record
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);
  
  if (error) {
    console.error('Error deleting media record:', error);
    throw error;
  }
  
  return true;
}

/**
 * Approve a media item
 */
export async function approveMedia(mediaId: string, reason?: string, moderatorId?: string): Promise<Media | null> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .update({
      status: MediaStatus.APPROVED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaId)
    .select()
    .single();
  
  if (error) {
    console.error('Error approving media:', error);
    throw error;
  }
  
  // Log the moderation action
  if (data && data.event_id) {
    try {
      // Skip moderation log if we don't have an event_id
      await supabase.from('moderation_logs').insert({
        event_id: data.event_id,
        media_id: mediaId,
        user_id: moderatorId || null,
        action: 'approve',
        reason: reason || null,
      });
    } catch (logError) {
      console.error('Error logging moderation action:', logError);
      // Don't throw, this is just logging
    }
  }
  
  return data as Media;
}

/**
 * Reject a media item
 */
export async function rejectMedia(mediaId: string, reason?: string, moderatorId?: string): Promise<Media | null> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('media')
    .update({
      status: MediaStatus.REJECTED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaId)
    .select()
    .single();
  
  if (error) {
    console.error('Error rejecting media:', error);
    throw error;
  }
  
  // Log the moderation action
  if (data && data.event_id) {
    try {
      // Skip moderation log if we don't have an event_id
      await supabase.from('moderation_logs').insert({
        event_id: data.event_id,
        media_id: mediaId,
        user_id: moderatorId || null,
        action: 'reject',
        reason: reason || null,
      });
    } catch (logError) {
      console.error('Error logging moderation action:', logError);
      // Don't throw, this is just logging
    }
  }
  
  return data as Media;
}

/**
 * Get all albums for an event
 */
export async function getEventAlbums(eventId: string): Promise<Album[]> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('albums')
    .select('*, media!albums_cover_media_id_fkey(url)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching event albums:', error);
    throw error;
  }
  
  // Transform the data to match our Album type
  return data.map((album: any) => ({
    ...album,
    cover_url: album.media?.url,
  })) as Album[];
}

/**
 * Get a single album by ID
 */
export async function getAlbumById(albumId: string): Promise<Album | null> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('albums')
    .select('*, media!albums_cover_media_id_fkey(url)')
    .eq('id', albumId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    
    console.error('Error fetching album by ID:', error);
    throw error;
  }
  
  // Transform to match our Album type
  return {
    ...data,
    cover_url: data.media?.url,
  } as Album;
}

/**
 * Get all media in an album
 */
export async function getAlbumMedia(albumId: string): Promise<Media[]> {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('album_media')
    .select('*, media:media_id(*)')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching album media:', error);
    throw error;
  }
  
  // Transform to get just the media objects
  return data.map((item: any) => item.media) as Media[];
}

/**
 * Create a new album
 */
export async function createAlbum(params: CreateAlbumParams): Promise<Album | null> {
  const supabase = getServerClient();
  
  const { eventId, title, description, coverMediaId, isPublic = true } = params;
  
  const { data, error } = await supabase
    .from('albums')
    .insert({
      event_id: eventId,
      title,
      description,
      cover_media_id: coverMediaId,
      is_public: isPublic,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating album:', error);
    throw error;
  }
  
  return data as Album;
}

/**
 * Update an album
 */
export async function updateAlbum(params: UpdateAlbumParams): Promise<Album | null> {
  const supabase = getServerClient();
  
  const { id, title, description, coverMediaId, isPublic } = params;
  
  const { data, error } = await supabase
    .from('albums')
    .update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(coverMediaId !== undefined && { cover_media_id: coverMediaId }),
      ...(isPublic !== undefined && { is_public: isPublic }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating album:', error);
    throw error;
  }
  
  return data as Album;
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string): Promise<boolean> {
  const supabase = getServerClient();
  
  // First, delete all the album media associations
  const { error: albumMediaError } = await supabase
    .from('album_media')
    .delete()
    .eq('album_id', albumId);
  
  if (albumMediaError) {
    console.error('Error deleting album media associations:', albumMediaError);
    // Still try to delete the album
  }
  
  // Then, delete the album itself
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId);
  
  if (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
  
  return true;
}

/**
 * Add a media item to an album
 */
export async function addMediaToAlbum(albumId: string, mediaId: string): Promise<boolean> {
  const supabase = getServerClient();
  
  // First, check if this media item is already in the album
  const { data: existingData, error: checkError } = await supabase
    .from('album_media')
    .select('*')
    .eq('album_id', albumId)
    .eq('media_id', mediaId);
  
  if (checkError) {
    console.error('Error checking for existing album media:', checkError);
    throw checkError;
  }
  
  if (existingData.length > 0) {
    // Already in the album, no need to add again
    return true;
  }
  
  // Get the current max sort order
  const { data: maxSortData, error: maxSortError } = await supabase
    .from('album_media')
    .select('sort_order')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: false })
    .limit(1);
  
  if (maxSortError) {
    console.error('Error getting max sort order:', maxSortError);
    throw maxSortError;
  }
  
  const nextSortOrder = maxSortData.length > 0 ? maxSortData[0].sort_order + 1 : 0;
  
  // Add the media to the album
  const { error } = await supabase
    .from('album_media')
    .insert({
      album_id: albumId,
      media_id: mediaId,
      sort_order: nextSortOrder,
    });
  
  if (error) {
    console.error('Error adding media to album:', error);
    throw error;
  }
  
  return true;
}

/**
 * Remove a media item from an album
 */
export async function removeMediaFromAlbum(albumId: string, mediaId: string): Promise<boolean> {
  const supabase = getServerClient();
  
  const { error } = await supabase
    .from('album_media')
    .delete()
    .eq('album_id', albumId)
    .eq('media_id', mediaId);
  
  if (error) {
    console.error('Error removing media from album:', error);
    throw error;
  }
  
  return true;
}

/**
 * Reorder media in an album
 */
export async function reorderAlbumMedia(albumId: string, mediaIds: string[]): Promise<boolean> {
  const supabase = getServerClient();
  
  // We'll use a transaction to update all the sort orders
  const updates = mediaIds.map((mediaId, index) => ({
    album_id: albumId,
    media_id: mediaId,
    sort_order: index,
  }));
  
  // First, delete all existing records
  const { error: deleteError } = await supabase
    .from('album_media')
    .delete()
    .eq('album_id', albumId);
  
  if (deleteError) {
    console.error('Error clearing album media for reordering:', deleteError);
    throw deleteError;
  }
  
  // Then, insert the new records with updated sort orders
  const { error: insertError } = await supabase
    .from('album_media')
    .insert(updates);
  
  if (insertError) {
    console.error('Error reordering album media:', insertError);
    throw insertError;
  }
  
  return true;
}

// Export the media service client
export const mediaServiceServer: MediaServiceClient = {
  supabase: getServerClient(),
  getEventMedia,
  getApprovedEventMedia,
  getPendingEventMedia,
  getRejectedEventMedia,
  getUserMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  uploadMedia: async () => { 
    throw new Error('uploadMedia is not available on the server. Use the client-side version.'); 
    return null;
  },
  approveMedia,
  rejectMedia,
  getEventAlbums,
  getAlbumById,
  getAlbumMedia,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addMediaToAlbum,
  removeMediaFromAlbum,
  reorderAlbumMedia,
}; 