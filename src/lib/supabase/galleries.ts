import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// Import cookies only when used
// import { cookies } from 'next/headers'
import { Gallery, GallerySettings, GalleryStats, GalleryWithPhotos } from '@/types/gallery'
import { createClient, createServerClient, handleError } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { DEFAULT_GALLERY_SETTINGS } from '@/lib/constants'

function createClientSideSupabase() {
  return createClientComponentClient<Database>()
}

/**
 * Get gallery for an event
 */
export async function getGalleryForEvent(eventId: string): Promise<Gallery | null> {
  const supabase = createClient()
  
  try {
    // @ts-ignore - Type error with Supabase query parameters
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .single()
    
    if (error) {
      console.error('Error fetching gallery:', error)
      return null
    }
    
    // Transform the gallery data to ensure correct typing
    if (data) {
      const galleryData = data as any;
      return {
        ...galleryData,
        settings: galleryData.settings as GallerySettings
      } as Gallery
    }
    
    return null
  } catch (error) {
    console.error('Exception in getGalleryForEvent:', error)
    return null
  }
}

/**
 * Create a gallery for an event
 */
export async function createGalleryForEvent(eventId: string): Promise<{ data: Gallery | null; error: Error | null }> {
  const supabase = createClient()
  
  try {
    // Check if gallery already exists for this event
    // @ts-ignore - Type error with Supabase query parameters
    const { data: existingGallery, error: checkError } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()
    
    if (checkError) {
      console.error('Error checking for existing gallery:', checkError)
      return { data: null, error: checkError }
    }
    
    // If gallery already exists, return it
    if (existingGallery) {
      return { data: existingGallery as unknown as Gallery, error: null }
    }
    
    // Get event details to set gallery name and thumbnail
    // @ts-ignore - Type error with Supabase query parameters
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name, organizer_id, cover_image_url, thumbnail_url')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      console.error('Error fetching event details:', eventError)
      return { data: null, error: eventError }
    }
    
    console.log('Event details for gallery creation:', event);
    
    // Safe access of event properties
    const eventData = event as any;
    const eventName = eventData?.name;
    const organizerId = eventData?.organizer_id;
    const thumbnailUrl = eventData?.thumbnail_url;
    const coverImageUrl = eventData?.cover_image_url;
    
    // Use event thumbnail or cover image for gallery thumbnail
    const galleryThumbnail = thumbnailUrl || coverImageUrl || null;
    
    // Create a new gallery
    const galleryInsert = {
      event_id: eventId,
      name: eventName ? `${eventName} Gallery` : `Event Gallery`,
      organizer_id: organizerId,
      settings: DEFAULT_GALLERY_SETTINGS,
      status: 'active', // Make sure gallery is always active regardless of event status
      thumbnail_url: galleryThumbnail,
    };
    
    // @ts-ignore - Type error with Supabase insert
    const { data, error } = await supabase
      .from('galleries')
      .insert(galleryInsert)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating gallery:', error)
      return { data: null, error }
    }
    
    console.log('Gallery created successfully:', data)
    return { data: data as unknown as Gallery, error: null }
  } catch (error) {
    console.error('Exception in createGalleryForEvent:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * Update gallery settings
 */
export async function updateGallerySettings(
  galleryId: string, 
  settings: Partial<GallerySettings>
): Promise<{ data: Gallery | null; error: Error | null }> {
  const supabase = createClient()
  
  try {
    // @ts-ignore - Type error with Supabase query parameters
    const { data, error } = await supabase
      .from('galleries')
      .update({ settings })
      .eq('id', galleryId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating gallery settings:', error)
      return { data: null, error }
    }
    
    return { data: data as unknown as Gallery, error: null }
  } catch (error) {
    console.error('Exception in updateGallerySettings:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * Get user galleries
 */
export async function getUserGalleries(): Promise<{ data: Gallery[] | null; error: Error | null }> {
  const supabase = createClient()
  
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }
    
    // Get all galleries for events organized by the user
    // @ts-ignore - Type error with Supabase query parameters
    const { data, error } = await supabase
      .from('galleries')
      .select(`
        *,
        events:event_id (
          name,
          date,
          status
        )
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user galleries:', error)
      return { data: null, error }
    }
    
    return { data: data as unknown as Gallery[], error: null }
  } catch (error) {
    console.error('Exception in getUserGalleries:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * Get gallery stats
 */
export async function getGalleryStats(galleryId: string): Promise<{ data: GalleryStats; error: Error | null }> {
  const supabase = createClient()
  
  try {
    // Get total photo count
    // @ts-ignore - Type error with Supabase query parameters
    const { count: totalPhotos, error: totalError } = await supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
    
    if (totalError) {
      console.error('Error fetching total photos:', totalError)
      return { 
        data: { 
          totalPhotos: 0, 
          approvedPhotos: 0, 
          pendingPhotos: 0,
          totalViews: 0,
          totalDownloads: 0
        }, 
        error: totalError 
      }
    }
    
    // Get approved photo count
    // @ts-ignore - Type error with Supabase query parameters
    const { count: approvedPhotos, error: approvedError } = await supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
      .eq('status', 'approved')
    
    if (approvedError) {
      console.error('Error fetching approved photos:', approvedError)
      return { 
        data: { 
          totalPhotos: 0, 
          approvedPhotos: 0, 
          pendingPhotos: 0,
          totalViews: 0,
          totalDownloads: 0
        }, 
        error: approvedError 
      }
    }
    
    return { 
      data: { 
        totalPhotos: totalPhotos || 0, 
        approvedPhotos: approvedPhotos || 0,
        pendingPhotos: (totalPhotos || 0) - (approvedPhotos || 0),
        totalViews: 0, // Default to 0 for now
        totalDownloads: 0 // Default to 0 for now
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Exception in getGalleryStats:', error);
    return { 
      data: { 
        totalPhotos: 0, 
        approvedPhotos: 0, 
        pendingPhotos: 0,
        totalViews: 0,
        totalDownloads: 0
      }, 
      error: error instanceof Error ? error : new Error(String(error)) 
    }
  }
}

/**
 * Delete a gallery
 */
export async function deleteGallery(galleryId: string): Promise<{ success: boolean; error: Error | null }> {
  const supabase = createClient()
  
  try {
    // Delete all photos in the gallery
    // @ts-ignore - Type error with Supabase query parameters
    const { error: photosError } = await supabase
      .from('photos')
      .delete()
      .eq('gallery_id', galleryId)
    
    if (photosError) {
      console.error('Error deleting gallery photos:', photosError)
      return { success: false, error: photosError }
    }
    
    // Delete the gallery
    // @ts-ignore - Type error with Supabase query parameters
    const { error } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId)
    
    if (error) {
      console.error('Error deleting gallery:', error)
      return { success: false, error }
    }
    
    return { success: true, error: null }
  } catch (error) {
    console.error('Exception in deleteGallery:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
} 