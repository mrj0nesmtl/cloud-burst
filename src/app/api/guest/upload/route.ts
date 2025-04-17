import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This endpoint handles guest photo uploads with invitation token
export async function POST(request: NextRequest) {
  try {
    // Get data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const invitationToken = formData.get('invitationToken') as string;
    const metadata = formData.get('metadata') as string;
    
    // Validate input
    if (!file || !eventId || !invitationToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      );
    }
    
    // Create Supabase client with service role for bypassing RLS
    // We use the environment variables directly to create a client with admin rights
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Verify the invitation token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id')
      .eq('token', invitationToken)
      .single();
      
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 401 }
      );
    }
    
    // Verify this token belongs to the event
    if (invitation.event_id !== eventId) {
      return NextResponse.json(
        { error: 'Invitation token does not match event' },
        { status: 401 }
      );
    }
    
    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).slice(2)}.${fileExtension}`;
    const filePath = `events/${eventId}/guest-uploads/${fileName}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }
    
    // Get public URL for file
    const { data: urlData } = await supabase.storage
      .from('event-photos')
      .getPublicUrl(filePath);
      
    const url = urlData?.publicUrl;
    
    if (!url) {
      return NextResponse.json(
        { error: 'Failed to get public URL for file' },
        { status: 500 }
      );
    }
    
    // Parse metadata if provided
    let metadataObj = {
      invitation_token: invitationToken,
      is_camera_capture: true,
      upload_source: 'guest-camera',
      captured_at: new Date().toISOString()
    };
    
    if (metadata) {
      try {
        const parsedMetadata = JSON.parse(metadata);
        metadataObj = { ...metadataObj, ...parsedMetadata };
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }
    
    // Insert media record
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .insert({
        event_id: eventId,
        storage_path: filePath,
        url: url,
        filename: fileName,
        original_filename: file.name,
        size_bytes: file.size,
        content_type: file.type,
        media_type: file.type.startsWith('image/') ? 'photo' : 'video',
        width: null, // Could be extracted from image if needed
        height: null, // Could be extracted from image if needed
        metadata: metadataObj,
        is_public: true,
        moderation_status: 'pending'
      })
      .select('id')
      .single();
      
    if (mediaError) {
      console.error('Media insert error:', mediaError);
      return NextResponse.json(
        { error: 'Failed to create media record' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      mediaId: mediaData.id,
      url: url
    });
    
  } catch (err) {
    console.error('Unhandled error in upload endpoint:', err);
    return NextResponse.json(
      { error: 'Server error processing upload' },
      { status: 500 }
    );
  }
} 