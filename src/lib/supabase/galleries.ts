import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// Import cookies only when used
// import { cookies } from 'next/headers'
import { Gallery, GallerySettings, GalleryStats, GalleryWithPhotos } from '@/types/gallery'
import { createClient } from '@supabase/supabase-js'

function createClientSideSupabase() {
  return createClientComponentClient()
}

/**
 * Get gallery for an event
 */
export async function getGalleryForEvent(eventId: string): Promise<Gallery | null> {
  const supabase = createClientSideSupabase()
  
  try {
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching gallery:', error)
      throw error
    }
    
    return data as Gallery | null
  } catch (error) {
    console.error('Error in getGalleryForEvent:', error)
    throw error
  }
}

/**
 * Create a gallery for an event
 */
export async function createGalleryForEvent(eventId: string): Promise<Gallery> {
  const supabase = createClientSideSupabase()
  
  try {
    // First check if a gallery already exists for this event
    const existingGallery = await getGalleryForEvent(eventId)
    
    if (existingGallery) {
      console.log('Gallery already exists for event:', eventId)
      return existingGallery
    }
    
    // Create default settings
    const defaultSettings: GallerySettings = {
      layout: 'grid',
      allowUploads: true,
      requireApproval: true,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
    
    // Create the gallery
    const { data: gallery, error: createError } = await supabase
      .from('galleries')
      .insert({
        event_id: eventId,
        settings: defaultSettings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()
    
    if (createError) {
      console.error('Error creating gallery:', createError)
      throw new Error(`Failed to create gallery: ${createError.message}`)
    }
    
    return gallery as Gallery
  } catch (error) {
    console.error('Error in createGalleryForEvent:', error)
    throw error
  }
}

/**
 * Update gallery settings
 */
export async function updateGallerySettings(
  galleryId: string, 
  settings: Partial<GallerySettings>
): Promise<Gallery> {
  // Client-side implementation only
  const supabase = createClientSideSupabase()
  
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
  
  // Update the gallery with the new settings
  const { data: updatedGallery, error: updateError } = await supabase
    .from('galleries')
    .update({ settings: updatedSettings })
    .eq('id', galleryId)
    .select('*')
    .single()
    
  if (updateError) {
    console.error('Error updating gallery settings:', updateError)
    throw new Error(`Failed to update gallery settings: ${updateError.message}`)
  }
  
  return updatedGallery as Gallery
}

/**
 * Get user galleries
 */
export async function getUserGalleries(): Promise<Gallery[]> {
  const supabase = createClientSideSupabase()
  
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error or no user:', userError)
      return []
    }
    
    // Get all events that the user is an organizer for
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', user.id)
    
    if (eventsError || !events || events.length === 0) {
      console.log('No events found for user')
      return []
    }
    
    // Get all galleries for these events
    const eventIds = events.map(event => event.id)
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('*')
      .in('event_id', eventIds)
    
    if (galleriesError) {
      console.error('Error fetching galleries:', galleriesError)
      return []
    }
    
    return galleries as Gallery[] || []
  } catch (error) {
    console.error('Error in getUserGalleries:', error)
    return []
  }
}

/**
 * Get gallery stats
 */
export async function getGalleryStats(galleryId: string): Promise<GalleryStats> {
  const supabase = createClientSideSupabase()
  
  try {
    // Get photo counts
    const { count: totalPhotos, error: totalError } = await supabase
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
    
    if (totalError) {
      console.error('Error fetching total photos:', totalError)
      throw totalError
    }
    
    // Get approved photo count
    const { count: approvedPhotos, error: approvedError } = await supabase
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
      .eq('is_approved', true)
    
    if (approvedError) {
      console.error('Error fetching approved photos:', approvedError)
      throw approvedError
    }
    
    // For views and downloads, we'll use placeholders for now
    // In a real implementation, you'd track these in separate tables
    
    return {
      totalPhotos: totalPhotos || 0,
      approvedPhotos: approvedPhotos || 0,
      pendingPhotos: (totalPhotos || 0) - (approvedPhotos || 0),
      totalViews: 0,
      totalDownloads: 0
    }
  } catch (error) {
    console.error('Error in getGalleryStats:', error)
    throw error
  }
}

/**
 * Delete a gallery
 */
export async function deleteGallery(galleryId: string): Promise<void> {
  const supabase = createClientSideSupabase()
  
  try {
    // Delete all photos first (this should cascade delete favorites and views)
    const { error: photosError } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('gallery_id', galleryId)
    
    if (photosError) {
      console.error('Error deleting gallery photos:', photosError)
      throw photosError
    }
    
    // Delete the gallery
    const { error: galleryError } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId)
    
    if (galleryError) {
      console.error('Error deleting gallery:', galleryError)
      throw galleryError
    }
  } catch (error) {
    console.error('Error in deleteGallery:', error)
    throw error
  }
} 