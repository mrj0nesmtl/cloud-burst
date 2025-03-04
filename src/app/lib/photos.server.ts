import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Photo, PhotoMetadata } from '@/types/events';
import { cookies } from 'next/headers';

type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
type PhotoUpdate = Database['public']['Tables']['photos']['Update'];
type PhotoRow = Database['public']['Tables']['photos']['Row'];

/**
 * Convert a database photo row to the Photo type used in the application
 */
export function mapDbPhotoToPhoto(photo: PhotoRow): Photo {
  // Extract metadata for size, mime_type, etc.
  const metadata = photo.metadata as PhotoMetadata || {};
  
  return {
    id: photo.id,
    event_id: photo.event_id,
    filename: photo.filename,
    storage_path: photo.storage_path,
    url: photo.url,
    thumbnail_url: photo.thumbnail_url || undefined,
    // These fields are in the Photo interface but not in the database schema
    // We'll extract them from metadata or use defaults
    size: metadata.size || 0,
    mime_type: metadata.mime_type || 'image/jpeg',
    width: metadata.width || null,
    height: metadata.height || null,
    uploaded_by: photo.uploaded_by,
    created_at: photo.created_at,
    updated_at: photo.updated_at || photo.created_at,
    is_approved: photo.is_approved,
    metadata: metadata || {},
  };
}

/**
 * Upload a photo to Supabase Storage and create a record in the photos table
 */
export async function uploadAndCreatePhoto(
  file: File,
  eventId: string,
  userId: string,
  metadata: PhotoMetadata = {}
): Promise<Photo | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Generate a unique filename
  const timestamp = new Date().getTime();
  const fileExt = file.name.split('.').pop();
  const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const storagePath = `events/${eventId}/${safeFileName}`;
  
  // Upload the file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('photos')
    .upload(storagePath, file);
  
  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    return null;
  }
  
  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase
    .storage
    .from('photos')
    .getPublicUrl(storagePath);
  
  // Create a record in the photos table
  const photoRecord: PhotoInsert = {
    event_id: eventId,
    filename: file.name,
    storage_path: storagePath,
    url: publicUrl,
    uploaded_by: userId,
    is_approved: false,
    metadata: metadata,
  };
  
  const { data: photoData, error: photoError } = await supabase
    .from('photos')
    .insert(photoRecord)
    .select()
    .single();
  
  if (photoError) {
    console.error('Error creating photo record:', photoError);
    return null;
  }
  
  return mapDbPhotoToPhoto(photoData);
}

/**
 * Upload a photo with tags to Supabase Storage and create a record in the photos table
 */
export async function uploadAndCreatePhotoWithTags(
  file: File,
  eventId: string,
  userId: string,
  tags: string[] = []
): Promise<Photo | null> {
  const metadata: PhotoMetadata = {
    tags: tags,
  };
  
  return uploadAndCreatePhoto(file, eventId, userId, metadata);
}

/**
 * Get all photos for an event
 */
export async function getEventPhotos(eventId: string): Promise<Photo[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching event photos:', error);
    return [];
  }
  
  return data.map(mapDbPhotoToPhoto);
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', photoId)
    .single();
  
  if (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
  
  return mapDbPhotoToPhoto(data);
}

/**
 * Update a photo's approval status
 */
export async function updatePhotoApproval(photoId: string, isApproved: boolean): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { error } = await supabase
    .from('photos')
    .update({ is_approved: isApproved } as PhotoUpdate)
    .eq('id', photoId);
  
  if (error) {
    console.error('Error updating photo approval:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete a photo from storage and the database
 */
export async function deletePhoto(photoId: string): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // First, get the photo to find its storage path
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', photoId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching photo for deletion:', fetchError);
    return false;
  }
  
  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from('photos')
    .remove([photo.storage_path]);
  
  if (storageError) {
    console.error('Error deleting photo from storage:', storageError);
    return false;
  }
  
  // Delete from database
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);
  
  if (dbError) {
    console.error('Error deleting photo from database:', dbError);
    return false;
  }
  
  return true;
}

/**
 * Add a tag to a photo
 */
export async function addTagToPhoto(photoId: string, tag: string): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // First, get the current photo metadata
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('metadata')
    .eq('id', photoId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching photo metadata:', fetchError);
    return false;
  }
  
  // Update the metadata with the new tag
  const metadata = photo.metadata as PhotoMetadata || {};
  const tags = metadata.tags || [];
  
  if (!tags.includes(tag)) {
    tags.push(tag);
  }
  
  const updatedMetadata: PhotoMetadata = {
    ...metadata,
    tags,
  };
  
  // Update the photo record
  const { error: updateError } = await supabase
    .from('photos')
    .update({ metadata: updatedMetadata } as PhotoUpdate)
    .eq('id', photoId);
  
  if (updateError) {
    console.error('Error updating photo tags:', updateError);
    return false;
  }
  
  return true;
}

/**
 * Remove a tag from a photo
 */
export async function removeTagFromPhoto(photoId: string, tag: string): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // First, get the current photo metadata
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('metadata')
    .eq('id', photoId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching photo metadata:', fetchError);
    return false;
  }
  
  // Update the metadata by removing the tag
  const metadata = photo.metadata as PhotoMetadata || {};
  const tags = metadata.tags || [];
  
  const updatedTags = tags.filter(t => t !== tag);
  
  const updatedMetadata: PhotoMetadata = {
    ...metadata,
    tags: updatedTags,
  };
  
  // Update the photo record
  const { error: updateError } = await supabase
    .from('photos')
    .update({ metadata: updatedMetadata } as PhotoUpdate)
    .eq('id', photoId);
  
  if (updateError) {
    console.error('Error updating photo tags:', updateError);
    return false;
  }
  
  return true;
} 