'use server';

import { revalidatePath } from 'next/cache';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function approveMedia(mediaId: string, reason?: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Verify the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to approve media'
      };
    }
    
    // Update the media status
    const { data, error } = await supabase
      .from('media')
      .update({
        status: 'approved',
        moderation_reason: reason || null,
        moderated_at: new Date().toISOString(),
        moderated_by: session.user.id
      })
      .eq('id', mediaId)
      .select()
      .single();
    
    if (error) {
      console.error('Error approving media:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Add moderation log entry
    await supabase
      .from('moderation_logs')
      .insert({
        media_id: mediaId,
        action: 'approved',
        reason: reason || null,
        moderator_id: session.user.id
      });
    
    // Revalidate the moderation page
    revalidatePath('/protected/gallery/moderate');
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in approveMedia action:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function rejectMedia(mediaId: string, reason?: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Verify the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to reject media'
      };
    }
    
    // Update the media status
    const { data, error } = await supabase
      .from('media')
      .update({
        status: 'rejected',
        moderation_reason: reason || null,
        moderated_at: new Date().toISOString(),
        moderated_by: session.user.id
      })
      .eq('id', mediaId)
      .select()
      .single();
    
    if (error) {
      console.error('Error rejecting media:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Add moderation log entry
    await supabase
      .from('moderation_logs')
      .insert({
        media_id: mediaId,
        action: 'rejected',
        reason: reason || null,
        moderator_id: session.user.id
      });
    
    // Revalidate the moderation page
    revalidatePath('/protected/gallery/moderate');
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in rejectMedia action:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function deleteMedia(mediaId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Verify the user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to delete media'
      };
    }
    
    // Get the media to delete first (to get storage path)
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('storage_path')
      .eq('id', mediaId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching media:', fetchError);
      return {
        success: false,
        error: fetchError.message
      };
    }
    
    // Delete from storage if storage_path exists
    if (media?.storage_path) {
      const { error: storageError } = await supabase
        .storage
        .from('media')
        .remove([media.storage_path]);
      
      if (storageError) {
        console.error('Error deleting media from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }
    
    // Delete from database
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);
    
    if (error) {
      console.error('Error deleting media from database:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Add moderation log entry
    await supabase
      .from('moderation_logs')
      .insert({
        media_id: mediaId,
        action: 'deleted',
        reason: 'Deleted by moderator',
        moderator_id: session.user.id
      });
    
    // Revalidate the moderation page
    revalidatePath('/protected/gallery/moderate');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error in deleteMedia action:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
} 