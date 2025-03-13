import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// Import cookies only when used
// import { cookies } from 'next/headers'
import { Gallery, GallerySettings, GalleryStats } from '@/types/gallery'
import { createClient } from '@supabase/supabase-js'

/**
 * Get gallery for an event
 */
export async function getGalleryForEvent(eventId: string): Promise<Gallery | null> {
  // Check if we're in a server or client context
  if (typeof window === 'undefined') {
    // Server-side
    const { getGalleryForEventServer } = await import('./galleries.server')
    return getGalleryForEventServer(eventId)
  } else {
    // Client-side (implemented for completeness, but should generally use server functions)
    const supabase = createClientSideSupabase()
    
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
}

/**
 * Create a gallery for an event
 */
export async function createGalleryForEvent(eventId: string): Promise<Gallery> {
  console.log('🔍 createGalleryForEvent: Starting gallery creation for event:', eventId);
  
  // Check if we're in a server or client context
  if (typeof window === 'undefined') {
    // Server-side
    const { createGalleryForEventServer } = await import('./galleries.server')
    return createGalleryForEventServer(eventId)
  } else {
    // Client-side implementation - generally this should be done server-side
    const supabase = createClientSideSupabase()
    
    try {
      // Check if gallery already exists
      console.log('🔍 createGalleryForEvent: Checking if gallery already exists');
      const { data: existingGallery, error: checkError } = await supabase
        .from('galleries')
        .select('*')
        .eq('event_id', eventId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('🔍 createGalleryForEvent: Error checking existing gallery:', checkError);
        throw new Error(`Error checking existing gallery: ${checkError.message}`);
      }
      
      if (existingGallery) {
        console.log('🔍 createGalleryForEvent: Gallery already exists:', existingGallery.id);
        return existingGallery as Gallery;
      }
      
      // Get user to verify permissions
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('🔍 createGalleryForEvent: User data:', userData?.user?.id);
      
      if (userError) {
        console.error('🔍 createGalleryForEvent: User auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      // Create gallery
      console.log('🔍 createGalleryForEvent: Creating gallery');
      const defaultSettings = {
        layout: 'grid',
        allowUploads: true,
        requireApproval: true,
        maxUploadSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      };
      
      const { data: gallery, error: createError } = await supabase
        .from('galleries')
        .insert({
          event_id: eventId,
          settings: defaultSettings
        })
        .select()
        .single();
      
      if (createError) {
        console.error('🔍 createGalleryForEvent: Error creating gallery:', createError);
        throw new Error(`Failed to create gallery: ${createError.message}`);
      }
      
      console.log('🔍 createGalleryForEvent: Gallery created successfully:', gallery.id);
      return gallery as Gallery;
      
    } catch (error) {
      console.error('🔍 createGalleryForEvent: Error in createGalleryForEvent:', error);
      throw error;
    }
  }
}

/**
 * Update gallery settings
 */
export async function updateGallerySettings(
  galleryId: string, 
  settings: Partial<GallerySettings>
): Promise<Gallery> {
  // Check if we're in a server or client context
  if (typeof window === 'undefined') {
    // Server-side
    const { updateGallerySettingsServer } = await import('./galleries.server')
    return updateGallerySettingsServer(galleryId, settings)
  } else {
    // Client-side implementation
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
}

// For client-side usage (safe in all contexts)
export const createClientSideSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

/**
 * Get user galleries - works in both client and server components
 */
export async function getUserGalleries(): Promise<Gallery[]> {
  // Check if we're in a server or client context
  if (typeof window === 'undefined') {
    // Server-side
    const { getUserGalleriesServer } = await import('./galleries.server')
    return getUserGalleriesServer()
  } else {
    // Client-side implementation
    const supabase = createClientSideSupabase()
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting user for galleries:', userError)
        return []
      }
      
      // Get all events that the user is an organizer for
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id)
      
      if (eventsError || !events || events.length === 0) {
        console.error('Error fetching events or no events found:', eventsError)
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
      console.error('Unexpected error in getUserGalleries:', error)
      return []
    }
  }
}

/**
 * Get gallery statistics
 */
export async function getGalleryStats(galleryId: string): Promise<GalleryStats> {
  // Check if we're in a server or client context
  if (typeof window === 'undefined') {
    // Server-side
    const { getGalleryStatsServer } = await import('./galleries.server')
    return getGalleryStatsServer(galleryId)
  } else {
    // Client-side implementation
    const supabase = createClientSideSupabase()
    
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
}

/**
 * Delete a gallery
 */
export async function deleteGallery(galleryId: string): Promise<void> {
  // Check if we're in a server or client context
  if (typeof window === 'undefined') {
    // Server-side
    const { deleteGalleryServer } = await import('./galleries.server')
    return deleteGalleryServer(galleryId)
  } else {
    // Client-side implementation
    const supabase = createClientSideSupabase()
    
    const { error } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId)
    
    if (error) {
      console.error('Error deleting gallery:', error)
      throw new Error(`Failed to delete gallery: ${error.message}`)
    }
  }
} 