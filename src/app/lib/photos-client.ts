import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Photo, PhotoMetadata } from '@/types/events';

type PhotoInsert = Database['public']['Tables']['photos']['Insert'];
type PhotoUpdate = Database['public']['Tables']['photos']['Update'];
type PhotoRow = Database['public']['Tables']['photos']['Row'];

/**
 * Convert a database photo row to the Photo type used in the application
 * This handles the mismatch between the database schema and the Photo interface
 */
export function mapDbPhotoToPhoto(photo: PhotoRow): Photo {
  // Extract metadata for size, mime_type, etc.
  const metadata = photo.metadata as PhotoMetadata || {};
  
  return {
    id: photo.id,
    event_id: photo.event_id || '',
    filename: photo.filename || '',
    storage_path: photo.storage_path,
    // These fields are in the Photo interface but not in the database schema
    // We'll extract them from metadata or use defaults
    size: metadata.size || 0,
    mime_type: metadata.mime_type || 'image/jpeg',
    width: metadata.width !== null ? metadata.width : undefined,
    height: metadata.height !== null ? metadata.height : undefined,
    uploaded_by: photo.uploaded_by,
    is_approved: photo.is_approved || false,
    metadata: metadata,
    created_at: photo.created_at || new Date().toISOString(),
    updated_at: photo.updated_at || photo.created_at || new Date().toISOString(),
  };
}

/**
 * Upload a photo to Supabase Storage and create a record in the photos table
 */
export async function uploadAndCreatePhoto(
  eventId: string,
  file: File,
  userId?: string,
  metadata: PhotoMetadata = {}
): Promise<Photo | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Get user ID if not provided
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }
    userId = user.id;
  }
  
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
  
  // Enhance metadata with file information
  const enhancedMetadata: PhotoMetadata = {
    ...metadata,
    size: file.size,
    mime_type: file.type,
    // We can't get width/height directly from File object
    // These would need to be calculated using an Image object if needed
  };
  
  // Create a record in the photos table
  const photoRecord: PhotoInsert = {
    event_id: eventId,
    filename: file.name,
    storage_path: storagePath,
    uploaded_by: userId,
    is_approved: false,
    metadata: enhancedMetadata,
  };
  
  // For database operations that might use the URL
  const photoRecordWithUrl = {
    ...photoRecord,
    url: publicUrl, // This will be used in the query but isn't part of PhotoInsert type
  };
  
  const { data: photoData, error: photoError } = await supabase
    .from('photos')
    .insert(photoRecordWithUrl)
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
  eventId: string,
  file: File,
  userId?: string,
  tags: string[] = []
): Promise<Photo | null> {
  const metadata: PhotoMetadata = {
    tags: tags,
  };
  
  return uploadAndCreatePhoto(eventId, file, userId, metadata);
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