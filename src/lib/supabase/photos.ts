import { createClient } from './client'
import { 
  CreatePhotoParams, 
  UpdatePhotoParams, 
  Photo 
} from '@/types/events'

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  eventId: string, 
  file: File
): Promise<{ path: string; url: string }> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  // Create a unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `events/${eventId}/${fileName}`
  
  // Upload the file
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) {
    console.error('Error uploading photo:', error)
    throw new Error(`Failed to upload photo: ${error.message}`)
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(data.path)
    
  return {
    path: data.path,
    url: publicUrl
  }
}

/**
 * Create a photo record in the database
 */
export async function createPhotoRecord(params: CreatePhotoParams): Promise<Photo> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('photos')
    .insert({
      ...params,
      uploaded_by: userData.user.id
    })
    .select('*')
    .single()
    
  if (error) {
    console.error('Error creating photo record:', error)
    throw new Error(`Failed to create photo record: ${error.message}`)
  }
  
  return data as Photo
}

/**
 * Upload a photo and create a database record
 */
export async function uploadAndCreatePhoto(
  eventId: string, 
  file: File
): Promise<Photo> {
  // Upload the file to storage
  const { path } = await uploadPhoto(eventId, file)
  
  // Create a record in the database
  return createPhotoRecord({
    event_id: eventId,
    storage_path: path,
    filename: file.name,
    size: file.size,
    mime_type: file.type,
    is_approved: false // Default to not approved
  })
}

/**
 * Update a photo record
 */
export async function updatePhoto(id: string, params: UpdatePhotoParams): Promise<Photo> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('photos')
    .update(params)
    .eq('id', id)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating photo:', error)
    throw new Error(`Failed to update photo: ${error.message}`)
  }
  
  return data as Photo
}

/**
 * Delete a photo and its storage file
 */
export async function deletePhoto(id: string): Promise<void> {
  const supabase = createClient()
  
  // First get the photo to get the storage path
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('id', id)
    .single()
    
  if (fetchError) {
    console.error('Error fetching photo:', fetchError)
    throw new Error(`Failed to fetch photo: ${fetchError.message}`)
  }
  
  // Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from('photos')
    .remove([photo.storage_path])
    
  if (storageError) {
    console.error('Error deleting photo from storage:', storageError)
    // Continue to delete the database record even if storage deletion fails
  }
  
  // Delete the database record
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', id)
    
  if (dbError) {
    console.error('Error deleting photo record:', dbError)
    throw new Error(`Failed to delete photo record: ${dbError.message}`)
  }
}

/**
 * Get a photo by ID
 */
export async function getPhoto(id: string): Promise<Photo> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching photo:', error)
    throw new Error(`Failed to fetch photo: ${error.message}`)
  }
  
  return data as Photo
}

/**
 * Get all photos for an event
 */
export async function getEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching event photos:', error)
    throw new Error(`Failed to fetch event photos: ${error.message}`)
  }
  
  return data as Photo[]
}

/**
 * Get approved photos for an event
 */
export async function getApprovedEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching approved event photos:', error)
    throw new Error(`Failed to fetch approved event photos: ${error.message}`)
  }
  
  return data as Photo[]
}

/**
 * Get pending approval photos for an event
 */
export async function getPendingEventPhotos(eventId: string): Promise<Photo[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching pending event photos:', error)
    throw new Error(`Failed to fetch pending event photos: ${error.message}`)
  }
  
  return data as Photo[]
}

/**
 * Approve a photo
 */
export async function approvePhoto(id: string): Promise<Photo> {
  return updatePhoto(id, { is_approved: true })
}

/**
 * Reject a photo
 */
export async function rejectPhoto(id: string): Promise<void> {
  return deletePhoto(id)
}

/**
 * Get the public URL for a photo
 */
export function getPhotoUrl(storagePath: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(storagePath)
    
  return publicUrl
}

/**
 * Get photos uploaded by the current user
 */
export async function getUserPhotos(): Promise<Photo[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('uploaded_by', userData.user.id)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching user photos:', error)
    throw new Error(`Failed to fetch user photos: ${error.message}`)
  }
  
  return data as Photo[]
} 