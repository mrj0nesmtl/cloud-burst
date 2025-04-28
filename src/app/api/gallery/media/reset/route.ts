import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const resetSchema = z.object({
  mediaIds: z.array(z.string().uuid()).nonempty('At least one media ID is required'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const validation = resetSchema.safeParse(body);
    
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
    
    // Update the media status for all selected items
    const { data, error } = await supabase
      .from('media')
      .update({
        status: 'pending',
        moderation_reason: reason || null,
        moderated_at: new Date().toISOString(),
        moderated_by: session.user.id
      })
      .in('id', mediaIds)
      .select();
    
    if (error) {
      console.error('Error resetting media status:', error);
      return NextResponse.json(
        { error: 'Failed to reset media status', details: error.message },
        { status: 500 }
      );
    }
    
    // Add moderation log entries
    const logEntries = mediaIds.map(mediaId => ({
      media_id: mediaId,
      action: 'reset',
      reason: reason || 'Reset to pending by moderator',
      moderator_id: session.user.id
    }));
    
    await supabase.from('moderation_logs').insert(logEntries);
    
    return NextResponse.json({
      success: true,
      count: mediaIds.length,
      data
    });
    
  } catch (error) {
    console.error('Error in media reset endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 