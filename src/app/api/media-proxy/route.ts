import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const bucket = searchParams.get('bucket') || 'media';

    if (!path) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    // Initialize Supabase client with server-side auth
    const supabase = createServerComponentClient({ cookies });

    // Fetch the file from Supabase Storage with authentication
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      console.error('Error fetching media from Supabase:', error);
      return new NextResponse('Error fetching media', { status: 500 });
    }

    if (!data) {
      return new NextResponse('Media not found', { status: 404 });
    }

    // Determine content type based on file extension
    const fileExtension = path.split('.').pop()?.toLowerCase() || '';
    let contentType = 'application/octet-stream';

    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'mov':
        contentType = 'video/quicktime';
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error in media proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Optimize for edge function deployment (optional)
export const runtime = 'edge'; 