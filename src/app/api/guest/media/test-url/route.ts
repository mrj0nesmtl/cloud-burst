import { NextResponse } from 'next/server';

/**
 * Development-only utility endpoint to get a placeholder image URL
 */
export async function GET() {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint only available in development' }, { status: 403 });
  }

  // Generate a random placeholder image URL
  const width = 800;
  const height = 600;
  const category = 'nature'; // Options: people, animals, arch, nature, tech
  
  // Use placeholder.com for testing
  const placeholderUrl = `https://placehold.co/${width}x${height}`;
  
  // Alternatively use Lorem Picsum for realistic images
  const loremPicsumUrl = `https://picsum.photos/${width}/${height}`;
  
  // Unsplash API (no API key needed for this URL)
  const unsplashUrl = `https://source.unsplash.com/random/${width}x${height}?${category}`;
  
  return NextResponse.json({
    placeholderUrl,
    loremPicsumUrl,
    unsplashUrl,
    curl: `curl -X POST http://localhost:3000/api/guest/media/update -H "Content-Type: application/json" -d '{"mediaId":"MEDIA_ID_HERE","url":"${unsplashUrl}"}'`
  });
} 