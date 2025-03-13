import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Gallery, GallerySettings, GalleryStats } from '@/types/gallery'

/**
 * Get user galleries from server component
 */
export async function getUserGalleriesServer(): Promise<Gallery[]> {
  console.log('🔍 getUserGalleriesServer: Starting')
  
  try {
    const supabase = createServerComponentClient({ cookies })
    
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
 * Get gallery for an event (server component implementation)
 */
export async function getGalleryForEventServer(eventId: string): Promise<Gallery | null> {
  const supabase = createServerComponentClient({ cookies })
  
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
 * Create a gallery for an event (server component implementation)
 */
export async function createGalleryForEventServer(eventId: string): Promise<Gallery> {
  console.log('🔍 createGalleryForEventServer: Starting gallery creation for event:', eventId);
  
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Check if gallery already exists
    console.log('🔍 createGalleryForEventServer: Checking if gallery already exists');
    const { data: existingGallery, error: checkError } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('🔍 createGalleryForEventServer: Error checking existing gallery:', checkError);
      throw new Error(`Error checking existing gallery: ${checkError.message}`);
    }
    
    if (existingGallery) {
      console.log('🔍 createGalleryForEventServer: Gallery already exists:', existingGallery.id);
      return existingGallery as Gallery;
    }
    
    // Get user to verify permissions
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('🔍 createGalleryForEventServer: User data:', userData?.user?.id);
    
    if (userError) {
      console.error('🔍 createGalleryForEventServer: User auth error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    // Verify user owns the event
    console.log('🔍 createGalleryForEventServer: Verifying event ownership');
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      console.error('🔍 createGalleryForEventServer: Error fetching event:', eventError);
      throw new Error(`Event not found: ${eventError.message}`);
    }
    
    console.log('🔍 createGalleryForEventServer: Event organizer:', event.organizer_id);
    console.log('🔍 createGalleryForEventServer: Current user:', userData?.user?.id);
    
    // Create gallery
    console.log('🔍 createGalleryForEventServer: Creating gallery');
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
      console.error('🔍 createGalleryForEventServer: Error creating gallery:', createError);
      throw new Error(`Failed to create gallery: ${createError.message}`);
    }
    
    console.log('🔍 createGalleryForEventServer: Gallery created successfully:', gallery.id);
    return gallery as Gallery;
    
  } catch (error) {
    console.error('🔍 createGalleryForEventServer: Error in createGalleryForEvent:', error);
    throw error;
  }
}

/**
 * Update gallery settings (server component implementation)
 */
export async function updateGallerySettingsServer(
  galleryId: string, 
  settings: Partial<GallerySettings>
): Promise<Gallery> {
  const supabase = createServerComponentClient({ cookies })
  
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
 * Get gallery statistics (server component implementation)
 */
export async function getGalleryStatsServer(galleryId: string): Promise<GalleryStats> {
  const supabase = createServerComponentClient({ cookies })
  
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
 * Delete a gallery (server component implementation)
 */
export async function deleteGalleryServer(galleryId: string): Promise<void> {
  const supabase = createServerComponentClient({ cookies })
  
  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', galleryId)
  
  if (error) {
    console.error('Error deleting gallery:', error)
    throw new Error(`Failed to delete gallery: ${error.message}`)
  }
} 