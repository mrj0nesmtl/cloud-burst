import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the invitation token from the query parameter
    const token = request.nextUrl.searchParams.get('token');
    
    // Get all media
    const { data: allMedia, error: mediaError } = await supabase
      .from('media')
      .select('id, event_id, media_type, created_at, storage_path');
      
    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }
    
    let invitationInfo = null;
    
    // If token is provided, get the invitation info
    if (token) {
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, event_id')
        .eq('token', token)
        .single();
        
      if (!invitationError && invitation) {
        invitationInfo = invitation;
        
        // Get media for this specific event
        const { data: eventMedia, error: eventMediaError } = await supabase
          .from('media')
          .select('id, event_id, media_type, created_at, storage_path')
          .eq('event_id', invitation.event_id);
          
        if (!eventMediaError) {
          invitationInfo.mediaCount = eventMedia?.length || 0;
          invitationInfo.media = eventMedia;
        }
      }
    }
    
    return NextResponse.json({
      totalMediaCount: allMedia?.length || 0,
      allMedia,
      invitation: invitationInfo
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 