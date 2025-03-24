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
  MediaServiceClient,
  mapDbMediaToMedia
} from '@/types/media';
import { createClient } from '@/lib/supabase/client';

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
 * Client-side Media Service
 * Contains methods for interacting with media and albums
 */
const mediaService: MediaServiceClient = {
  supabase: createClient(),
  
  // Media methods
  getEventMedia: async (eventId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('event_id', eventId)
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
      .eq('event_id', eventId)
      .eq('status', MediaStatus.APPROVED)
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
      .eq('event_id', eventId)
      .eq('status', MediaStatus.PENDING)
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
      .eq('event_id', eventId)
      .eq('status', MediaStatus.REJECTED)
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
      .eq('uploaded_by', uid)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user media:', error);
      return [];
    }
    
    return (data || []).map(media => mapDbMediaToMedia(media));
  },
  
  getMediaById: async (mediaId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
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
      uploaded_by: params.userId,
      media_type: params.mediaType,
      storage_path: params.filePath,
      filename: params.filename,
      url: params.url,
      thumbnail_url: params.thumbnailUrl,
      title: params.title,
      description: params.description,
      size: params.size,
      mime_type: params.mimeType,
      width: params.width,
      height: params.height,
      duration: params.duration,
      is_public: params.isPublic || false,
      status: MediaStatus.PENDING,
      metadata: params.metadata || {},
    };
    
    const { data, error } = await supabase
      .from('media')
      .insert(mediaRecord)
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
      .update(updateRecord)
      .eq('id', params.id)
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
      .eq('id', mediaId)
      .single();
      
    if (mediaError) {
      console.error('Error fetching media to delete:', mediaError);
      return false;
    }
    
    // Delete from storage if path exists
    if (mediaData.storage_path) {
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
      .eq('id', mediaId);
      
    if (error) {
      console.error('Error deleting media record:', error);
      return false;
    }
    
    return true;
  },
  
  uploadMedia: async (file: File, eventId: string, onProgress?: (progress: number) => void) => {
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
  
  approveMedia: async (mediaId: string, reason?: string) => {
    const supabase = createClient();
    
    // Update media status
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user for moderation:', userError);
      return null;
    }
    
    // Get media info for logging
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('event_id')
      .eq('id', mediaId)
      .single();
      
    if (mediaError) {
      console.error('Error getting media for moderation log:', mediaError);
      return null;
    }
    
    // Create a moderation log
    try {
      const logEntry = {
        media_id: mediaId,
        user_id: userData.user?.id,
        event_id: mediaData.event_id,
        action: 'approve',
        reason: reason || 'Media approved',
      };
      
      await supabase
        .from('moderation_logs' as any)
        .insert(logEntry);
    } catch (err) {
      console.error('Error creating moderation log:', err);
      // Continue with approval anyway
    }
    
    // Update the media status
    return await mediaService.updateMedia({
      id: mediaId,
      status: MediaStatus.APPROVED,
      isPublic: true,
    });
  },
  
  rejectMedia: async (mediaId: string, reason?: string) => {
    const supabase = createClient();
    
    // Update media status
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user for moderation:', userError);
      return null;
    }
    
    // Get media info for logging
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('event_id')
      .eq('id', mediaId)
      .single();
      
    if (mediaError) {
      console.error('Error getting media for moderation log:', mediaError);
      return null;
    }
    
    // Create a moderation log
    try {
      const logEntry = {
        media_id: mediaId,
        user_id: userData.user?.id,
        event_id: mediaData.event_id,
        action: 'reject',
        reason: reason || 'Media rejected',
      };
      
      await supabase
        .from('moderation_logs' as any)
        .insert(logEntry);
    } catch (err) {
      console.error('Error creating moderation log:', err);
      // Continue with rejection anyway
    }
    
    // Update the media status
    return await mediaService.updateMedia({
      id: mediaId,
      status: MediaStatus.REJECTED,
      isPublic: false,
    });
  },
  
  // Album methods
  getEventAlbums: async (eventId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('albums' as any)
        .select('*')
        .eq('event_id', eventId)
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
        .from('albums' as any)
        .select('*')
        .eq('id', albumId)
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
        .from('album_media' as any)
        .select('media_id, sort_order')
        .eq('album_id', albumId)
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
        .in('id', mediaIds);
        
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
        .from('albums' as any)
        .insert(albumRecord)
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
        .from('albums' as any)
        .update(updateRecord)
        .eq('id', params.id)
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
        .from('album_media' as any)
        .delete()
        .eq('album_id', albumId);
        
      // Delete the album
      const { error } = await supabase
        .from('albums' as any)
        .delete()
        .eq('id', albumId);
        
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
        .from('album_media' as any)
        .select('id')
        .eq('album_id', albumId)
        .eq('media_id', mediaId)
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
        .from('album_media' as any)
        .select('sort_order')
        .eq('album_id', albumId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      // Use type assertion to avoid TypeScript errors
      const nextSortOrder = sortData 
        ? ((sortData as any).sort_order || 0) + 1 
        : 1;
      
      // Create new association
      const { error } = await supabase
        .from('album_media' as any)
        .insert({
          album_id: albumId,
          media_id: mediaId,
          sort_order: nextSortOrder,
        });
        
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
        .from('album_media' as any)
        .delete()
        .eq('album_id', albumId)
        .eq('media_id', mediaId);
        
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
        .from('album_media' as any)
        .delete()
        .eq('album_id', albumId);
        
      // Insert new ordering
      const { error } = await supabase
        .from('album_media' as any)
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
