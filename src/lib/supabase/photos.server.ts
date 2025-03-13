import { createServerClient } from './client';
import { Database } from '@/types/supabase';
import { Photo, PhotoMetadata } from '@/types/events';

type PhotoRow = Database['public']['Tables']['photos']['Row'];

/**
 * Convert a database photo row to the Photo type used in the application
 */
export function mapDbPhotoToPhoto(photo: PhotoRow): Photo {
  // Extract metadata or use empty object
  const metadata = photo.metadata as PhotoMetadata || {};
  
  return {
    id: photo.id,
    event_id: photo.event_id,
    filename: photo.filename,
    storage_path: photo.storage_path,
    url: photo.url || '',
    thumbnail_url: photo.thumbnail_url || undefined,
    uploaded_by: photo.uploaded_by,
    created_at: photo.created_at,
    updated_at: photo.updated_at || photo.created_at,
    is_approved: photo.is_approved,
    metadata: metadata
  };
}

/**
 * Get all photos for an event - SERVER VERSION
 */
export async function getEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = await createServerClient();
  
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
 * Get approved photos for an event - SERVER VERSION
 */
export async function getApprovedEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching approved event photos:', error);
    return [];
  }
  
  return data.map(mapDbPhotoToPhoto);
}

/**
 * Get pending photos for an event - SERVER VERSION
 */
export async function getPendingEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending event photos:', error);
    return [];
  }
  
  return data.map(mapDbPhotoToPhoto);
}

/**
 * Get all pending photos across all events - SERVER VERSION
 */
export async function getAllPendingPhotos(): Promise<Photo[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('photos')
    .select('*, events(name)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all pending photos:', error);
    return [];
  }
  
  return data.map(mapDbPhotoToPhoto);
}

/**
 * Update a photo's approval status - SERVER VERSION
 */
export async function updatePhotoApproval(photoId: string, isApproved: boolean): Promise<boolean> {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('photos')
    .update({ is_approved: isApproved })
    .eq('id', photoId);
  
  if (error) {
    console.error('Error updating photo approval:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete a photo from storage and the database - SERVER VERSION
 */
export async function deletePhoto(photoId: string): Promise<boolean> {
  const supabase = await createServerClient();
  
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
 * Get a single photo by ID - SERVER VERSION
 */
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const supabase = await createServerClient();
  
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