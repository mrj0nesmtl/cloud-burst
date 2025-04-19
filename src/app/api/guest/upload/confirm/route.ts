import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateGuestToken } from '@/lib/auth/tokens';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, photoId } = body;
    
    // Validate request
    if (!token || !photoId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate token
    const tokenData = await validateGuestToken(token);
    if (!tokenData || !tokenData.eventId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get event and guest information
    const eventId = tokenData.eventId;
    const guestId = tokenData.guestId;
    
    if (!eventId || !guestId) {
      return NextResponse.json({ error: 'Invalid token data' }, { status: 401 });
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Fetch the media record to get the storage path
    const { data: mediaRecord, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', photoId)
      .eq('event_id', eventId)
      .single();
    
    if (fetchError || !mediaRecord) {
      console.error('Error fetching media record:', fetchError);
      return NextResponse.json({ error: 'Media record not found' }, { status: 404 });
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = await supabase
      .storage
      .from('media')
      .getPublicUrl(mediaRecord.storage_path);
    
    // Generate a thumbnail URL (in a real implementation, you would create a thumbnail)
    // For now, we'll just use the original image URL
    const publicUrl = publicUrlData.publicUrl;
    const thumbnailUrl = publicUrl;
    
    // Update the media record to mark it as uploaded and add the URLs
    const { data: updatedMedia, error: updateError } = await supabase
      .from('media')
      .update({
        url: publicUrl,
        thumbnail_url: thumbnailUrl,
        status: 'APPROVED', // Auto-approve for simplicity
        is_approved: true,   // You might want to set this to false and require manual approval
        updated_at: new Date().toISOString()
      })
      .eq('id', photoId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating media record:', updateError);
      return NextResponse.json({ error: 'Failed to update media record' }, { status: 500 });
    }
    
    // Return success with the photo URL
    return NextResponse.json({
      success: true,
      photoUrl: publicUrl,
      photoId: photoId,
      media: updatedMedia
    });
    
  } catch (error) {
    console.error('Error processing upload confirmation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 