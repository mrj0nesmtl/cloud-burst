import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Development-only utility endpoint to update media URLs
 * This is a temporary endpoint to help with debugging and development
 */
export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint only available in development' }, { status: 403 });
  }

  try {
    // Parse request body
    const body = await request.json();
    const { mediaId, url } = body;
    
    // Validate request
    if (!mediaId || !url) {
      return NextResponse.json({ error: 'Missing required fields: mediaId and url' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Update the media item
    const { data, error } = await supabase
      .from('media')
      .update({ 
        url: url,
        thumbnail_url: url,
        updated_at: new Date().toISOString()
      })
      .eq('id', mediaId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating media URL:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`Updated media ID ${mediaId} with URL: ${url}`);
    
    return NextResponse.json({
      message: 'Media URL updated successfully',
      media: data
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 