import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const deleteSchema = z.object({
  mediaIds: z.array(z.string().uuid()).nonempty('At least one media ID is required'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validation = deleteSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { mediaIds, reason } = validation.data;
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify the user is logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the media to delete first (to get storage paths)
    const { data: mediaToDelete, error: fetchError } = await supabase
      .from('media')
      .select('id, storage_path')
      .in('id', mediaIds);
    
    if (fetchError) {
      console.error('Error fetching media:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch media details', details: fetchError.message },
        { status: 500 }
      );
    }
    
    // Add moderation log entries before deletion
    const logEntries = mediaIds.map(mediaId => ({
      media_id: mediaId,
      action: 'deleted',
      reason: reason || 'Deleted by moderator',
      moderator_id: session.user.id
    }));
    
    const { error: logError } = await supabase
      .from('moderation_logs')
      .insert(logEntries);
      
    if (logError) {
      console.error('Error creating deletion logs:', logError);
      // Continue with deletion even if logging fails
    }
    
    // Delete from storage if storage_path exists
    for (const media of mediaToDelete) {
      if (media?.storage_path) {
        const { error: storageError } = await supabase
          .storage
          .from('media')
          .remove([media.storage_path]);
        
        if (storageError) {
          console.error(`Error deleting media ${media.id} from storage:`, storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .in('id', mediaIds);
    
    if (deleteError) {
      console.error('Error deleting media from database:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete media from database', details: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      count: mediaIds.length
    });
    
  } catch (error) {
    console.error('Error in media delete endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 