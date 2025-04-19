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
  MediaStatus,
  Album,
  AlbumMedia,
  ModerationLog,
  CreateAlbumParams,
  UpdateAlbumParams,
  MediaUploadResult,
  MediaServiceClient
} from '@/types/media';
import { createClient } from '@/lib/supabase/client';

/**
 * Get image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    // Validate that the file is actually an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type: Not an image'));
      return;
    }
    
    // Validate file size to prevent loading extremely large images
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      reject(new Error('Image file is too large (max 20MB)'));
      return;
    }
    
    const img = new Image();
    
    // Set up error handling
    img.onerror = () => {
      // Revoke the object URL to prevent memory leaks
      if (img.src) {
        URL.revokeObjectURL(img.src);
      }
      reject(new Error('Failed to load image'));
    };
    
    // Set up load handler
    img.onload = () => {
      // Get dimensions
      const dimensions = {
        width: img.width,
        height: img.height
      };
      
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(img.src);
      
      // Validate dimensions
      if (dimensions.width === 0 || dimensions.height === 0) {
        reject(new Error('Invalid image dimensions'));
        return;
      }
      
      resolve(dimensions);
    };
    
    // Create a secure object URL
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};

export async function getEventMedia(eventId: string): Promise<Media[]> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching event media:', error);
    return [];
  }
  
  return data.map(mapDbMediaToMedia);
}

/**
 * Get a media item by ID - CLIENT VERSION
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

export async function uploadAndCreateMedia(
  file: File,
  eventId: string,
  userId: string | null,
  title: string = '',
  description: string = '',
  isPublic: boolean = false,
  mediaType: MediaType = MediaType.PHOTO,
  metadata: Record<string, any> = {}
): Promise<Media | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Generate a unique filename
  const timestamp = new Date().getTime();
  const fileExt = file.name.split('.').pop();
  const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const storagePath = `events/${eventId}/${safeFileName}`;
  
  // Upload the file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('event-photos')
    .upload(storagePath, file);
  
  if (uploadError) {
    console.error('Error uploading media:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }
  
  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase
    .storage
    .from('event-photos')
    .getPublicUrl(storagePath);
  
  // Create a record in the media table
  const mediaRecord = {
    event_id: eventId,
    uploaded_by: userId,
    media_type: mediaType === MediaType.VIDEO ? 'video' : 'photo',
    storage_path: storagePath,
    filename: safeFileName,
    original_filename: file.name,
    url: publicUrl,
    size_bytes: file.size,
    content_type: file.type,
    title: title,
    description: description,
    is_public: isPublic,
    status: 'pending',
    metadata: metadata
  };
  
  const { data: mediaData, error: mediaError } = await supabase
    .from('media')
    .insert(mediaRecord)
    .select()
    .single();
  
  if (mediaError) {
    console.error('Error creating media record:', mediaError);
    
    // Log the insertion payload for debugging
    console.error('Media insert payload:', mediaRecord);
    
    throw new Error(`Failed to create media record: ${mediaError.message}`);
  }
  
  return mapDbMediaToMedia(mediaData);
}

/**
 * Maps a database media record to the Media type
 */
function mapDbMediaToMedia(mediaRecord: any): Media {
  return {
    id: mediaRecord.id,
    eventId: mediaRecord.event_id,
    mediaType: mediaRecord.media_type as MediaType,
    storagePath: mediaRecord.storage_path,
    filename: mediaRecord.filename || '',
    originalFilename: mediaRecord.original_filename || '',
    url: mediaRecord.url || '',
    thumbnailUrl: mediaRecord.thumbnail_url || '',
    size: mediaRecord.size_bytes || 0,
    width: mediaRecord.width || null,
    height: mediaRecord.height || null,
    title: mediaRecord.title || '',
    description: mediaRecord.description || '',
    isPublic: mediaRecord.is_public || false,
    status: mediaRecord.status || 'pending',
    metadata: mediaRecord.metadata || {},
    createdAt: mediaRecord.created_at,
    updatedAt: mediaRecord.updated_at
  };
}

/**
 * Get public URL for a media item
 */
export function getMediaPublicUrl(media: Media): string {
  if (media.url) {
    return media.url;
  }
  
  const supabase = createClientComponentClient<Database>();
  return supabase
    .storage
    .from('event-photos')
    .getPublicUrl(media.storagePath)
    .data
    .publicUrl;
}

// Create a typed Supabase client to use with media service
const supabaseClient = createClient();

/**
 * Client-side Media Service
 * Contains methods for interacting with media and albums
 */
const mediaService: MediaServiceClient = {
  // Use explicit type casting to fix type compatibility issues
  supabase: supabaseClient as any,
  
  // Media methods
  getEventMedia: async (eventId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId as any)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching event media:', error);
      return [];
    }
    
    return (data || []).map(media => mapDbMediaToMedia(media));
  },
  
  getApprovedEventMedia: async (eventId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId as any)
      .eq('status', MediaStatus.APPROVED as any)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching approved event media:', error);
      return [];
    }
    
    return (data || []).map(media => mapDbMediaToMedia(media));
  },
  
  getPendingEventMedia: async (eventId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId as any)
      .eq('status', MediaStatus.PENDING as any)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching pending event media:', error);
      return [];
    }
    
    return (data || []).map(media => mapDbMediaToMedia(media));
  },
  
  getRejectedEventMedia: async (eventId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId as any)
      .eq('status', MediaStatus.REJECTED as any)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching rejected event media:', error);
      return [];
    }
    
    return (data || []).map(media => mapDbMediaToMedia(media));
  },
  
  getUserMedia: async (userId: string = '') => {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('Error getting user:', userError);
      return [];
    }
    
    const uid = userId || userData.user.id;
    
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('uploaded_by', uid as any)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user media:', error);
      return [];
    }
    
    return (data || []).map(media => mapDbMediaToMedia(media));
  },
  
  getMediaById: async (mediaId: string): Promise<Media | null> => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId as any)
      .single();
      
    if (error) {
      console.error('Error fetching media by ID:', error);
      return null;
    }
    
    return mapDbMediaToMedia(data);
  },
  
  createMedia: async (params: CreateMediaParams) => {
    const supabase = createClient();
    const mediaRecord = {
      event_id: params.eventId,
      media_type: params.mediaType,
      storage_path: params.storagePath,
      filename: params.filename,
      original_filename: params.originalFilename,
      url: params.url,
      thumbnail_url: params.thumbnailUrl,
      title: params.title,
      description: params.description,
      size: params.size,
      mime_type: params.contentType,
      width: params.width,
      height: params.height,
      is_public: params.isPublic || false,
      status: params.status || MediaStatus.PENDING,
      metadata: params.metadata || {},
    };
    
    const { data, error } = await supabase
      .from('media')
      .insert(mediaRecord as any)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating media:', error);
      return null;
    }
    
    return mapDbMediaToMedia(data);
  },
  
  updateMedia: async (params: UpdateMediaParams) => {
    const supabase = createClient();
    const updateRecord: Record<string, any> = {
      ...(params.title !== undefined && { title: params.title }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.status !== undefined && { status: params.status }),
      ...(params.isPublic !== undefined && { is_public: params.isPublic }),
      ...(params.metadata !== undefined && { metadata: params.metadata }),
      updated_at: new Date().toISOString(),
    };
    
    // If status is being updated, also update is_approved for backward compatibility
    if (params.status !== undefined) {
      updateRecord.is_approved = params.status === MediaStatus.APPROVED;
    }
    
    const { data, error } = await supabase
      .from('media')
      .update(updateRecord as any)
      .eq('id', params.id as any)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating media:', error);
      return null;
    }
    
    return mapDbMediaToMedia(data);
  },
  
  deleteMedia: async (mediaId: string) => {
    const supabase = createClient();
    
    // First, get the media to find its storage path
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('storage_path')
      .eq('id', mediaId as any)
      .single();
      
    if (mediaError) {
      console.error('Error fetching media to delete:', mediaError);
      return false;
    }
    
    // Safe type checking - ensure mediaData exists and has storage_path property
    if (mediaData && typeof mediaData === 'object' && 'storage_path' in mediaData && mediaData.storage_path) {
      const { error: storageError } = await supabase
        .storage
        .from('media')
        .remove([mediaData.storage_path]);
        
      if (storageError) {
        console.error('Error deleting media from storage:', storageError);
        // Continue anyway to delete the database record
      }
    }
    
    // Delete the database record
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId as any);
      
    if (error) {
      console.error('Error deleting media record:', error);
      return false;
    }
    
    return true;
  },
  
  uploadMedia: async (file: File, eventId: string, onProgress?: (progress: number) => void): Promise<MediaUploadResult | null> => {
    const supabase = createClient();
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
    const storagePath = `events/${eventId}/${file.type.startsWith('video') ? 'videos' : 'photos'}/${safeFileName}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('media')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        // onProgress would be handled if supported by Supabase
      });
      
    if (error) {
      console.error('Error uploading media:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('media')
      .getPublicUrl(storagePath);
      
    return {
      path: storagePath,
      url: publicUrl
    };
  },
  
  approveMedia: async (mediaId: string, reason?: string): Promise<Media | null> => {
    try {
      // Fetch media item details
      const { data: mediaData, error: fetchError } = await mediaService.supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();

      if (fetchError) {
        console.error('Error fetching media data:', fetchError);
        throw new Error('Failed to approve media: could not fetch media details');
      }

      // Check if mediaData exists and has event_id property
      if (!mediaData || typeof mediaData !== 'object') {
        throw new Error('Failed to approve media: media data is invalid');
      }

      const eventId = 'event_id' in mediaData ? mediaData.event_id : '';
      
      // Update the media status to approved
      const { data: updatedMedia, error: updateError } = await mediaService.supabase
        .from('media')
        .update({ 
          status: MediaStatus.APPROVED,
          is_approved: true
        })
        .eq('id', mediaId)
        .select()
        .single();

      if (updateError) {
        console.error('Error approving media:', updateError);
        throw new Error('Failed to approve media');
      }

      try {
        // Log the approval action to moderation_logs
        await mediaService.supabase.from('moderation_logs').insert({
          media_id: mediaId,
          user_id: 'system', // This should be replaced with the actual user ID
          action: 'approve',
          reason: reason || 'Media approved',
          event_id: eventId || '' // Ensure event_id is never null
        });
      } catch (logError) {
        console.error('Error creating moderation log:', logError);
        // Continue anyway since the media was updated
      }

      console.log(`Media ${mediaId} approved successfully`);
      return mapDbMediaToMedia(updatedMedia);
    } catch (error) {
      console.error('Error in approveMedia:', error);
      return null;
    }
  },
  
  rejectMedia: async (mediaId: string, reason?: string): Promise<Media | null> => {
    try {
      // Fetch media item details
      const { data: mediaData, error: fetchError } = await mediaService.supabase
        .from('media')
        .select('*')
        .eq('id', mediaId)
        .single();

      if (fetchError) {
        console.error('Error fetching media data:', fetchError);
        throw new Error('Failed to reject media: could not fetch media details');
      }

      // Check if mediaData exists and has event_id property
      if (!mediaData || typeof mediaData !== 'object') {
        throw new Error('Failed to reject media: media data is invalid');
      }

      const eventId = 'event_id' in mediaData ? mediaData.event_id : '';

      // Update the media status to rejected
      const { data: updatedMedia, error: updateError } = await mediaService.supabase
        .from('media')
        .update({ 
          status: MediaStatus.REJECTED,
          is_approved: false,
          rejection_reason: reason || 'Media rejected'
        })
        .eq('id', mediaId)
        .select()
        .single();

      if (updateError) {
        console.error('Error rejecting media:', updateError);
        throw new Error('Failed to reject media');
      }

      try {
        // Log the rejection action to moderation_logs
        await mediaService.supabase.from('moderation_logs').insert({
          media_id: mediaId,
          user_id: 'system', // This should be replaced with the actual user ID
          action: 'reject',
          reason: reason || 'Media rejected',
          event_id: eventId || '' // Ensure event_id is never null
        });
      } catch (logError) {
        console.error('Error creating moderation log:', logError);
        // Continue anyway since the media was updated
      }

      console.log(`Media ${mediaId} rejected successfully`);
      return mapDbMediaToMedia(updatedMedia);
    } catch (error) {
      console.error('Error in rejectMedia:', error);
      return null;
    }
  },
  
  // Album methods
  getEventAlbums: async (eventId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('event_id', eventId as any)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching event albums:', error);
        return [];
      }
      
      return data as unknown as Album[] || [];
    } catch (err) {
      console.error('Error fetching event albums:', err);
      return [];
    }
  },
  
  getAlbumById: async (albumId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('id', albumId as any)
        .single();
        
      if (error) {
        console.error('Error fetching album by ID:', error);
        return null;
      }
      
      return data as unknown as Album;
    } catch (err) {
      console.error('Error fetching album by ID:', err);
      return null;
    }
  },
  
  getAlbumMedia: async (albumId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('album_media')
        .select('media_id, sort_order')
        .eq('album_id', albumId as any)
        .order('sort_order', { ascending: true });
        
      if (error) {
        console.error('Error fetching album media:', error);
        return [];
      }
      
      // No media in album
      if (!data || data.length === 0) {
        return [];
      }
      
      // Fetch all media items in one query
      const mediaIds = data.map((item: any) => item.media_id);
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .in('id', mediaIds as any);
        
      if (mediaError) {
        console.error('Error fetching media for album:', mediaError);
        return [];
      }
      
      // Map to Media objects and sort by the original sort_order
      const mediaMap = new Map();
      mediaData.forEach((item: any) => {
        mediaMap.set(item.id, mapDbMediaToMedia(item));
      });
      
      // Return in sort order
      return data
        .map((item: any) => ({ media: mediaMap.get(item.media_id), sortOrder: item.sort_order }))
        .filter((item: any) => item.media)
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((item: any) => item.media);
    } catch (err) {
      console.error('Error fetching album media:', err);
      return [];
    }
  },
  
  createAlbum: async (params: CreateAlbumParams) => {
    const supabase = createClient();
    try {
      const albumRecord = {
        event_id: params.eventId,
        title: params.title,
        description: params.description,
        cover_media_id: params.coverMediaId,
        is_public: params.isPublic !== undefined ? params.isPublic : true,
      };
      
      const { data, error } = await supabase
        .from('albums')
        .insert(albumRecord as any)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating album:', error);
        return null;
      }
      
      return data as unknown as Album;
    } catch (err) {
      console.error('Error creating album:', err);
      return null;
    }
  },
  
  updateAlbum: async (params: UpdateAlbumParams) => {
    const supabase = createClient();
    try {
      const updateRecord = {
        ...(params.title !== undefined && { title: params.title }),
        ...(params.description !== undefined && { description: params.description }),
        ...(params.coverMediaId !== undefined && { cover_media_id: params.coverMediaId }),
        ...(params.isPublic !== undefined && { is_public: params.isPublic }),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('albums')
        .update(updateRecord as any)
        .eq('id', params.id as any)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating album:', error);
        return null;
      }
      
      return data as unknown as Album;
    } catch (err) {
      console.error('Error updating album:', err);
      return null;
    }
  },
  
  deleteAlbum: async (albumId: string) => {
    const supabase = createClient();
    
    try {
      // Delete album media associations first
      await supabase
        .from('album_media')
        .delete()
        .eq('album_id', albumId as any);
        
      // Delete the album
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId as any);
        
      if (error) {
        console.error('Error deleting album:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting album:', err);
      return false;
    }
  },
  
  addMediaToAlbum: async (albumId: string, mediaId: string) => {
    const supabase = createClient();
    
    try {
      // Check if the association already exists
      const { data: existingData, error: existingError } = await supabase
        .from('album_media')
        .select('id')
        .eq('album_id', albumId as any)
        .eq('media_id', mediaId as any)
        .maybeSingle();
        
      if (existingError) {
        console.error('Error checking album media association:', existingError);
        return false;
      }
      
      // If association exists, return success
      if (existingData) {
        return true;
      }
      
      // Get the highest sort order
      const { data: sortData } = await supabase
        .from('album_media')
        .select('sort_order')
        .eq('album_id', albumId as any)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      // Use type assertion to avoid TypeScript errors
      const nextSortOrder = sortData 
        ? ((sortData as any).sort_order || 0) + 1 
        : 1;
      
      // Create new association
      const { error } = await supabase
        .from('album_media')
        .insert({
          album_id: albumId,
          media_id: mediaId,
          sort_order: nextSortOrder,
        } as any);
        
      if (error) {
        console.error('Error adding media to album:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error adding media to album:', err);
      return false;
    }
  },
  
  removeMediaFromAlbum: async (albumId: string, mediaId: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('album_media')
        .delete()
        .eq('album_id', albumId as any)
        .eq('media_id', mediaId as any);
        
      if (error) {
        console.error('Error removing media from album:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error removing media from album:', err);
      return false;
    }
  },
  
  reorderAlbumMedia: async (albumId: string, mediaIds: string[]) => {
    const supabase = createClient();
    
    try {
      // Create update array
      const updates = mediaIds.map((mediaId, index) => ({
        album_id: albumId,
        media_id: mediaId,
        sort_order: index,
      }));
      
      // Delete existing
      await supabase
        .from('album_media')
        .delete()
        .eq('album_id', albumId as any);
        
      // Insert new ordering
      const { error } = await supabase
        .from('album_media')
        .insert(updates as any);
        
      if (error) {
        console.error('Error reordering album media:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error reordering album media:', err);
      return false;
    }
  },
};

export default mediaService;
