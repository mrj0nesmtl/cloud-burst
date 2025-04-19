import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';
import { validateGuestToken } from '@/lib/auth/tokens';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, fileName, fileType, fileSize } = body;
    
    // Validate request
    if (!token || !fileName || !fileType) {
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
    
    // Create unique photo ID
    const photoId = uuidv4();
    
    // Generate storage path
    const storagePath = `events/${eventId}/photos/${photoId}`;
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Create a pre-signed URL for upload
    const { data, error } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(storagePath);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }
    
    // Create a pending media record in the database
    const { error: dbError } = await supabase
      .from('media')
      .insert({
        id: photoId,
        event_id: eventId,
        guest_id: guestId,
        media_type: 'PHOTO',
        storage_path: storagePath,
        filename: fileName,
        original_filename: fileName,
        size: fileSize,
        status: 'PENDING',
        is_approved: false,
        is_public: true,
      });
    
    if (dbError) {
      console.error('Error creating media record:', dbError);
      return NextResponse.json({ error: 'Failed to create media record' }, { status: 500 });
    }
    
    // Return the signed URL and photo ID
    return NextResponse.json({
      uploadUrl: data.signedUrl,
      photoId: photoId,
      fields: data.token // Some supabase instances return a token instead of fields
    });
    
  } catch (error) {
    console.error('Error processing upload init request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 