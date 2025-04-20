'use server';

import { revalidatePath } from 'next/cache';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function batchApproveMedia(mediaIds: string[], reason?: string) {
  try {
    if (!mediaIds.length) {
      return {
        success: false,
        error: 'No media items selected'
      };
    }

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
    
    // Update the media status for all selected items
    const { data, error } = await supabase
      .from('media')
      .update({
        status: 'approved',
        moderation_reason: reason || null,
        moderated_at: new Date().toISOString(),
        moderated_by: session.user.id
      })
      .in('id', mediaIds)
      .select();
    
    if (error) {
      console.error('Error approving media batch:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Add moderation log entries
    const logEntries = mediaIds.map(mediaId => ({
      media_id: mediaId,
      action: 'approved',
      reason: reason || null,
      moderator_id: session.user.id
    }));
    
    const { error: logError } = await supabase
      .from('moderation_logs')
      .insert(logEntries);
    
    if (logError) {
      console.error('Error creating moderation logs:', logError);
      // Continue despite log error
    }
    
    // Revalidate the moderation page
    revalidatePath('/protected/gallery/moderate');
    
    return {
      success: true,
      count: mediaIds.length,
      data
    };
  } catch (error) {
    console.error('Error in batchApproveMedia action:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function batchRejectMedia(mediaIds: string[], reason?: string) {
  try {
    if (!mediaIds.length) {
      return {
        success: false,
        error: 'No media items selected'
      };
    }

    if (!reason) {
      return {
        success: false,
        error: 'Reason is required for batch rejection'
      };
    }

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
    
    // Update the media status for all selected items
    const { data, error } = await supabase
      .from('media')
      .update({
        status: 'rejected',
        moderation_reason: reason,
        moderated_at: new Date().toISOString(),
        moderated_by: session.user.id
      })
      .in('id', mediaIds)
      .select();
    
    if (error) {
      console.error('Error rejecting media batch:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Add moderation log entries
    const logEntries = mediaIds.map(mediaId => ({
      media_id: mediaId,
      action: 'rejected',
      reason: reason,
      moderator_id: session.user.id
    }));
    
    const { error: logError } = await supabase
      .from('moderation_logs')
      .insert(logEntries);
    
    if (logError) {
      console.error('Error creating moderation logs:', logError);
      // Continue despite log error
    }
    
    // Revalidate the moderation page
    revalidatePath('/protected/gallery/moderate');
    
    return {
      success: true,
      count: mediaIds.length,
      data
    };
  } catch (error) {
    console.error('Error in batchRejectMedia action:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
} 