import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Gallery, GallerySettings, GalleryStats } from '@/types/gallery'

/**
 * Get gallery for an event
 */
export async function getGalleryForEvent(eventId: string): Promise<Gallery | null> {
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
 * Create a gallery for an event
 */
export async function createGalleryForEvent(eventId: string): Promise<Gallery> {
  console.log('🔍 createGalleryForEvent: Starting gallery creation for event:', eventId);
  
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Check if gallery already exists
    console.log('🔍 createGalleryForEvent: Checking if gallery already exists');
    const { data: existingGallery, error: checkError } = await supabase
      .from('galleries')
      .select('*') // Select all fields instead of just id
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
    
    // Verify user owns the event
    console.log('🔍 createGalleryForEvent: Verifying event ownership');
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      console.error('🔍 createGalleryForEvent: Error fetching event:', eventError);
      throw new Error(`Event not found: ${eventError.message}`);
    }
    
    console.log('🔍 createGalleryForEvent: Event organizer:', event.organizer_id);
    console.log('🔍 createGalleryForEvent: Current user:', userData?.user?.id);
    
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

/**
 * Update gallery settings
 */
export async function updateGallerySettings(
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
 * Get all galleries for a user
 */
export async function getUserGalleries(): Promise<Gallery[]> {
  console.log('🔍 getUserGalleries: Starting gallery retrieval');
  
  try {
    // Create server-side client
    const supabase = createServerComponentClient({ cookies });
    console.log('🔍 getUserGalleries: Supabase client created');
    
    // Try to get user
    let user;
    try {
      console.log('🔍 getUserGalleries: Attempting to get authenticated user');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('🔍 getUserGalleries: User auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!userData || !userData.user) {
        console.error('🔍 getUserGalleries: No user data returned');
        throw new Error('User not authenticated');
      }
      
      user = userData.user;
      console.log('🔍 getUserGalleries: User authenticated:', user.email);
    } catch (error) {
      console.error('🔍 getUserGalleries: Error getting user:', error);
      throw new Error(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Get user's events
    console.log('🔍 getUserGalleries: Fetching events for user:', user.id);
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, date, status, organizer_id')
      .eq('organizer_id', user.id);
    
    if (eventsError) {
      console.error('🔍 getUserGalleries: Error fetching events:', eventsError);
      throw new Error(`Error fetching events: ${eventsError.message}`);
    }
    
    console.log('🔍 getUserGalleries: Events found:', events?.length || 0);
    
    if (!events || events.length === 0) {
      console.log('🔍 getUserGalleries: No events found for user');
      return [];
    }
    
    // Get galleries for the user's events
    const eventIds = events.map(event => event.id);
    console.log('🔍 getUserGalleries: Fetching galleries for event IDs:', eventIds);
    
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('*, events!inner(id, name, date, status, organizer_id)')
      .in('event_id', eventIds);
    
    if (galleriesError) {
      console.error('🔍 getUserGalleries: Error fetching galleries:', galleriesError);
      throw new Error(`Error fetching galleries: ${galleriesError.message}`);
    }
    
    console.log('🔍 getUserGalleries: Galleries found:', galleries?.length || 0);
    console.log('🔍 getUserGalleries: Gallery data:', JSON.stringify(galleries, null, 2));
    
    return galleries as Gallery[] || [];
    
  } catch (error) {
    console.error('🔍 getUserGalleries: Error in getUserGalleries:', error);
    throw error;
  }
}

/**
 * Get gallery statistics
 */
export async function getGalleryStats(galleryId: string): Promise<GalleryStats> {
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
 * Delete a gallery
 */
export async function deleteGallery(galleryId: string): Promise<void> {
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