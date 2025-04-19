import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateGuestToken, validateMediaAccessToken } from '@/lib/auth/tokens';

export async function GET(
  request: NextRequest,
  { params }: { params: { mediaId: string } }
) {
  const { mediaId } = params;
  const searchParams = new URL(request.url).searchParams;
  const token = searchParams.get('token');

  console.log(`Attempting to fetch media: ${mediaId}, token present: ${!!token}`);

  try {
    const supabase = createClient();
    let eventId = null;
    
    // Try to validate token if provided, but don't require it
    if (token) {
      try {
        const tokenData = await validateMediaAccessToken(token, mediaId);
        if (tokenData && tokenData.eventId) {
          eventId = tokenData.eventId;
          console.log(`Token validated for event: ${eventId}`);
        }
      } catch (tokenError) {
        console.log(`Token validation failed, continuing anyway: ${tokenError}`);
        // Continue without a valid token
      }
    }
    
    // Try a simple query first to see what columns are available
    const { data: mediaColumns, error: columnsError } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .limit(1);
    
    if (columnsError) {
      console.error(`Error fetching media columns: ${columnsError.message}`);
      return NextResponse.json({ error: 'Error fetching media' }, { status: 500 });
    }
    
    // If we got data, use it directly
    if (mediaColumns && mediaColumns.length > 0) {
      const mediaItem = mediaColumns[0];
      
      // Log the raw media item to help with debugging
      console.log(`Raw media data:`, {
        id: mediaItem.id,
        url: mediaItem.url,
        thumbnail_url: mediaItem.thumbnail_url,
        storage_path: mediaItem.storage_path
      });
      
      // Make sure we have a valid URL
      let mediaUrl = mediaItem.url;
      let thumbnailUrl = mediaItem.thumbnail_url;
      
      // If no URL but we have a storage path, generate a URL
      if (!mediaUrl && mediaItem.storage_path) {
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(mediaItem.storage_path);
        
        mediaUrl = data.publicUrl;
        console.log(`Generated URL from storage path: ${mediaUrl}`);
      }
      
      // Fallback: If still no URL, check if storage_path is actually a URL
      if (!mediaUrl && mediaItem.storage_path && (
        mediaItem.storage_path.startsWith('http://') || 
        mediaItem.storage_path.startsWith('https://')
      )) {
        mediaUrl = mediaItem.storage_path;
        console.log(`Using storage_path as URL: ${mediaUrl}`);
      }
      
      // Map the raw data to the expected format
      const mappedMedia = {
        id: mediaItem.id,
        eventId: mediaItem.event_id,
        mediaType: mediaItem.media_type || 'PHOTO',
        storagePath: mediaItem.storage_path,
        filename: mediaItem.filename,
        originalFilename: mediaItem.original_filename || mediaItem.filename,
        url: mediaUrl,
        thumbnailUrl: thumbnailUrl || mediaUrl,
        size: mediaItem.size,
        width: mediaItem.width || 800,
        height: mediaItem.height || 600,
        title: mediaItem.title || '',
        description: mediaItem.description || '',
        isPublic: mediaItem.is_public || true,
        status: mediaItem.status || 'ACTIVE',
        metadata: mediaItem.metadata || {},
        createdAt: mediaItem.created_at,
        updatedAt: mediaItem.updated_at || mediaItem.created_at
      };
      
      console.log(`Successfully fetched media: ${mediaId}, URL: ${mappedMedia.url}`);
      return NextResponse.json({ media: mappedMedia });
    }
    
    // If we didn't get data, return 404
    console.error(`No media found with ID: ${mediaId}`);
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 