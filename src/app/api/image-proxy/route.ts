import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Get the path parameter from the query string
  const path = request.nextUrl.searchParams.get('path');
  
  if (!path) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }
  
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Fetch the file from Supabase storage
    const { data, error } = await supabase
      .storage
      .from('event-photos')
      .download(path);
      
    if (error || !data) {
      console.error('Error fetching image from Supabase:', error);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Get the file type to set the correct content-type
    const contentType = path.toLowerCase().endsWith('.jpg') || path.toLowerCase().endsWith('.jpeg')
      ? 'image/jpeg'
      : path.toLowerCase().endsWith('.png')
        ? 'image/png'
        : path.toLowerCase().endsWith('.gif')
          ? 'image/gif'
          : 'application/octet-stream';
    
    // Return the image with the appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error in image proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 