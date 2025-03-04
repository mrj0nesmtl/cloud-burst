import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Photo, PhotoMetadata } from '@/types/events';
import { cookies } from 'next/headers';

// Re-export client-side functions and types
export { 
  mapDbPhotoToPhoto, 
  uploadAndCreatePhoto, 
  uploadAndCreatePhotoWithTags 
} from './photos-client';

type PhotoUpdate = Database['public']['Tables']['photos']['Update'];

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
  
  // Import the function dynamically to avoid circular dependencies
  const { mapDbPhotoToPhoto } = await import('./photos-client');
  return data.map(mapDbPhotoToPhoto);
}

/**
 * Get approved photos for an event
 */
export async function getApprovedEventPhotos(eventId: string): Promise<Photo[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
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
  
  // Import the function dynamically to avoid circular dependencies
  const { mapDbPhotoToPhoto } = await import('./photos-client');
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
  
  // Import the function dynamically to avoid circular dependencies
  const { mapDbPhotoToPhoto } = await import('./photos-client');
  return mapDbPhotoToPhoto(data);
}

/**
 * Get the URL for a photo
 */
export function getPhotoUrl(photo: Photo): string {
  // If the photo has a URL property from the database, use that
  if ('url' in photo && typeof photo.url === 'string') {
    return photo.url;
  }
  
  // Otherwise, construct a URL from the storage path
  // This is a fallback and might need to be adjusted based on your Supabase configuration
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return '';
  }
  
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${photo.storage_path}`;
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