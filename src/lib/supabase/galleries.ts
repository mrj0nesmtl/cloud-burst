import { createClient } from './client'
import { Gallery, GallerySettings, GalleryStats } from '@/types/gallery'

/**
 * Get gallery for an event
 */
export async function getGalleryForEvent(eventId: string): Promise<Gallery | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('event_id', eventId)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - gallery doesn't exist
      return null
    }
    
    console.error('Error fetching gallery:', error)
    throw new Error(`Failed to fetch gallery: ${error.message}`)
  }
  
  return data as Gallery
}

/**
 * Create a gallery for an event
 */
export async function createGalleryForEvent(eventId: string): Promise<Gallery> {
  const supabase = createClient()
  
  // Check if a gallery already exists
  const existingGallery = await getGalleryForEvent(eventId)
  if (existingGallery) {
    return existingGallery
  }
  
  // Default gallery settings
  const defaultSettings: GallerySettings = {
    layout: 'grid',
    allowUploads: true,
    requireApproval: true,
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
  
  const { data, error } = await supabase
    .from('galleries')
    .insert({
      event_id: eventId,
      settings: defaultSettings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('*')
    .single()
    
  if (error) {
    console.error('Error creating gallery:', error)
    throw new Error(`Failed to create gallery: ${error.message}`)
  }
  
  return data as Gallery
}

/**
 * Update gallery settings
 */
export async function updateGallerySettings(
  galleryId: string, 
  settings: Partial<GallerySettings>
): Promise<Gallery> {
  const supabase = createClient()
  
  // Get current gallery to merge settings
  const { data: currentGallery, error: getError } = await supabase
    .from('galleries')
    .select('settings')
    .eq('id', galleryId)
    .single()
    
  if (getError) {
    console.error('Error fetching gallery settings:', getError)
    throw new Error(`Failed to fetch gallery settings: ${getError.message}`)
  }
  
  // Merge current settings with new settings
  const updatedSettings = {
    ...(currentGallery.settings as GallerySettings),
    ...settings
  }
  
  const { data, error } = await supabase
    .from('galleries')
    .update({
      settings: updatedSettings,
      updated_at: new Date().toISOString()
    })
    .eq('id', galleryId)
    .select('*')
    .single()
    
  if (error) {
    console.error('Error updating gallery settings:', error)
    throw new Error(`Failed to update gallery settings: ${error.message}`)
  }
  
  return data as Gallery
}

/**
 * Get all galleries for a user
 */
export async function getUserGalleries(): Promise<Gallery[]> {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) {
    throw new Error('User not authenticated')
  }
  
  // Get all events for the user
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', userData.user.id)
  
  if (eventsError) {
    console.error('Error fetching user events:', eventsError)
    throw new Error(`Failed to fetch user events: ${eventsError.message}`)
  }
  
  if (!events || events.length === 0) {
    return []
  }
  
  // Get galleries for all user events
  const eventIds = events.map(event => event.id)
  const { data: galleries, error: galleriesError } = await supabase
    .from('galleries')
    .select('*')
    .in('event_id', eventIds)
    .order('created_at', { ascending: false })
  
  if (galleriesError) {
    console.error('Error fetching user galleries:', galleriesError)
    throw new Error(`Failed to fetch user galleries: ${galleriesError.message}`)
  }
  
  return galleries as Gallery[]
}

/**
 * Get gallery statistics
 */
export async function getGalleryStats(galleryId: string): Promise<GalleryStats> {
  const supabase = createClient()
  
  // Get the gallery to find the event ID
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('event_id')
    .eq('id', galleryId)
    .single()
  
  if (galleryError) {
    console.error('Error fetching gallery:', galleryError)
    throw new Error(`Failed to fetch gallery: ${galleryError.message}`)
  }
  
  // Get photo counts
  const { count: totalPhotos, error: totalError } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', gallery.event_id)
  
  const { count: approvedPhotos, error: approvedError } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', gallery.event_id)
    .eq('is_approved', true)
  
  if (totalError || approvedError) {
    console.error('Error fetching photo counts:', totalError || approvedError)
    throw new Error(`Failed to fetch photo counts: ${(totalError || approvedError)?.message}`)
  }
  
  // For now, we don't track views and downloads, so we'll return 0
  return {
    totalPhotos: totalPhotos || 0,
    approvedPhotos: approvedPhotos || 0,
    pendingPhotos: (totalPhotos || 0) - (approvedPhotos || 0),
    totalViews: 0,
    totalDownloads: 0
  }
}

/**
 * Delete a gallery
 */
export async function deleteGallery(galleryId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', galleryId)
  
  if (error) {
    console.error('Error deleting gallery:', error)
    throw new Error(`Failed to delete gallery: ${error.message}`)
  }
} 