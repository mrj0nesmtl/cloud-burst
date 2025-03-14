import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Gallery, GallerySettings, GalleryStats } from '@/types/gallery'

/**
 * Get user galleries from the server context
 */
export async function getUserGalleriesServer(): Promise<Gallery[]> {
  console.log('🔍 getUserGalleriesServer: Starting')
  
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('🔍 getUserGalleriesServer: Auth error:', userError)
      return []
    }
    
    if (!user) {
      console.log('🔍 getUserGalleriesServer: No authenticated user')
      return []
    }
    
    // Get all events that the user is an organizer for
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', user.id)
    
    if (eventsError) {
      console.error('🔍 getUserGalleriesServer: Error fetching events:', eventsError)
      return []
    }
    
    if (!events || events.length === 0) {
      console.log('🔍 getUserGalleriesServer: No events found for user')
      return []
    }
    
    // Get all galleries for these events
    const eventIds = events.map(event => event.id)
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('*')
      .in('event_id', eventIds)
    
    if (galleriesError) {
      console.error('🔍 getUserGalleriesServer: Error fetching galleries:', galleriesError)
      return []
    }
    
    console.log('🔍 getUserGalleriesServer: Found galleries:', galleries?.length || 0)
    return galleries as Gallery[] || []
  } catch (error) {
    console.error('🔍 getUserGalleriesServer: Unexpected error:', error)
    return []
  }
}

/**
 * Create a gallery for an event from server context
 */
export async function createGalleryForEventServer(eventId: string): Promise<Gallery> {
  console.log('🔍 createGalleryForEventServer: Starting for event:', eventId)
  
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Check if gallery already exists
    const { data: existingGallery, error: checkError } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('🔍 createGalleryForEventServer: Error checking gallery:', checkError)
      throw new Error(`Error checking existing gallery: ${checkError.message}`)
    }
    
    if (existingGallery) {
      console.log('🔍 createGalleryForEventServer: Gallery already exists:', existingGallery.id)
      return existingGallery as Gallery
    }
    
    // Get user for verification
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('🔍 createGalleryForEventServer: Auth error:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    
    console.log('🔍 createGalleryForEventServer: Authenticated as user:', user?.id)
    
    // Create gallery with default settings
    const defaultSettings = {
      layout: 'grid',
      allowUploads: true,
      requireApproval: true,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
    
    // Verify that the user has access to this event before creating the gallery
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      console.error('🔍 createGalleryForEventServer: Error fetching event:', eventError)
      throw new Error(`Error fetching event: ${eventError.message}`)
    }
    
    if (event.organizer_id !== user?.id) {
      console.error('🔍 createGalleryForEventServer: User not authorized for this event')
      throw new Error('User not authorized to create gallery for this event')
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
      console.error('🔍 createGalleryForEventServer: Error creating gallery:', createError)
      throw new Error(`Failed to create gallery: ${createError.message}`)
    }
    
    console.log('🔍 createGalleryForEventServer: Gallery created successfully:', gallery.id)
    return gallery as Gallery
  } catch (error) {
    console.error('🔍 createGalleryForEventServer: Error:', error)
    throw error
  }
}

/**
 * Get gallery for an event from server context
 */
export async function getGalleryForEventServer(eventId: string): Promise<Gallery | null> {
  console.log('🔍 getGalleryForEventServer: Starting for event:', eventId)
  
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()
    
    if (error) {
      console.error('🔍 getGalleryForEventServer: Error fetching gallery:', error)
      throw error
    }
    
    return data as Gallery | null
  } catch (error) {
    console.error('🔍 getGalleryForEventServer: Error:', error)
    throw error
  }
}

/**
 * Update gallery settings from server context
 */
export async function updateGallerySettingsServer(
  galleryId: string, 
  settings: Partial<GallerySettings>
): Promise<Gallery> {
  console.log('🔍 updateGallerySettingsServer: Starting for gallery:', galleryId)
  
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Get current gallery to merge settings
    const { data: currentGallery, error: getError } = await supabase
      .from('galleries')
      .select('settings, event_id')
      .eq('id', galleryId)
      .single()
    
    if (getError) {
      console.error('🔍 updateGallerySettingsServer: Error fetching gallery:', getError)
      throw new Error(`Failed to fetch gallery settings: ${getError.message}`)
    }
    
    // Verify user has permission to update this gallery
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('🔍 updateGallerySettingsServer: Auth error:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    
    // Get the event to check organizer
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', currentGallery.event_id)
      .single()
    
    if (eventError) {
      console.error('🔍 updateGallerySettingsServer: Error fetching event:', eventError)
      throw new Error(`Error fetching event: ${eventError.message}`)
    }
    
    if (event.organizer_id !== user?.id) {
      console.error('🔍 updateGallerySettingsServer: User not authorized for this gallery')
      throw new Error('User not authorized to update gallery settings')
    }
    
    // Merge current settings with new settings
    const updatedSettings = {
      ...(currentGallery.settings as GallerySettings),
      ...settings
    }
    
    // Update the gallery
    const { data: updatedGallery, error: updateError } = await supabase
      .from('galleries')
      .update({ 
        settings: updatedSettings,
        updated_at: new Date().toISOString() 
      })
      .eq('id', galleryId)
      .select('*')
      .single()
    
    if (updateError) {
      console.error('🔍 updateGallerySettingsServer: Error updating gallery:', updateError)
      throw new Error(`Failed to update gallery settings: ${updateError.message}`)
    }
    
    console.log('🔍 updateGallerySettingsServer: Gallery updated successfully')
    return updatedGallery as Gallery
  } catch (error) {
    console.error('🔍 updateGallerySettingsServer: Error:', error)
    throw error
  }
}

/**
 * Get gallery stats from server context
 */
export async function getGalleryStatsServer(galleryId: string): Promise<GalleryStats> {
  console.log('🔍 getGalleryStatsServer: Starting for gallery:', galleryId)
  
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Get photo counts
    const { count: totalPhotos, error: totalError } = await supabase
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
    
    if (totalError) {
      console.error('🔍 getGalleryStatsServer: Error fetching total photos:', totalError)
      throw totalError
    }
    
    // Get approved photo count
    const { count: approvedPhotos, error: approvedError } = await supabase
      .from('gallery_photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
      .eq('is_approved', true)
    
    if (approvedError) {
      console.error('🔍 getGalleryStatsServer: Error fetching approved photos:', approvedError)
      throw approvedError
    }
    
    return {
      totalPhotos: totalPhotos || 0,
      approvedPhotos: approvedPhotos || 0,
      pendingPhotos: (totalPhotos || 0) - (approvedPhotos || 0),
      totalViews: 0,
      totalDownloads: 0
    }
  } catch (error) {
    console.error('🔍 getGalleryStatsServer: Error:', error)
    throw error
  }
}

/**
 * Delete a gallery from server context
 */
export async function deleteGalleryServer(galleryId: string): Promise<void> {
  console.log('🔍 deleteGalleryServer: Starting for gallery:', galleryId)
  
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Verify user has permission to delete this gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('event_id')
      .eq('id', galleryId)
      .single()
    
    if (galleryError) {
      console.error('🔍 deleteGalleryServer: Error fetching gallery:', galleryError)
      throw new Error(`Failed to fetch gallery: ${galleryError.message}`)
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('🔍 deleteGalleryServer: Auth error:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    
    // Get the event to check organizer
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', gallery.event_id)
      .single()
    
    if (eventError) {
      console.error('🔍 deleteGalleryServer: Error fetching event:', eventError)
      throw new Error(`Error fetching event: ${eventError.message}`)
    }
    
    if (event.organizer_id !== user?.id) {
      console.error('🔍 deleteGalleryServer: User not authorized for this gallery')
      throw new Error('User not authorized to delete gallery')
    }
    
    // Delete all photos first (this should cascade delete favorites and views)
    const { error: photosError } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('gallery_id', galleryId)
    
    if (photosError) {
      console.error('🔍 deleteGalleryServer: Error deleting gallery photos:', photosError)
      throw photosError
    }
    
    // Delete the gallery
    const { error: deleteError } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId)
    
    if (deleteError) {
      console.error('🔍 deleteGalleryServer: Error deleting gallery:', deleteError)
      throw deleteError
    }
    
    console.log('🔍 deleteGalleryServer: Gallery deleted successfully')
  } catch (error) {
    console.error('🔍 deleteGalleryServer: Error:', error)
    throw error
  }
} 