import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Development-only utility to update all media items with placeholder images
 */
export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Endpoint only available in development' }, { status: 403 });
  }

  try {
    const supabase = createClient();
    
    // Fetch all media items
    const { data: media, error } = await supabase
      .from('media')
      .select('id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching media:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!media || media.length === 0) {
      return NextResponse.json({ message: 'No media items found' });
    }
    
    // Update each media item with a placeholder image
    const updates = await Promise.all(media.map(async (item, index) => {
      // Generate unique URLs for each image to avoid caching issues
      const width = 800;
      const height = 600;
      const seed = Date.now() + index;
      const placeholderUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      
      const { data, error } = await supabase
        .from('media')
        .update({ 
          url: placeholderUrl,
          thumbnail_url: placeholderUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
        
      if (error) {
        console.error(`Error updating media ${item.id}:`, error);
        return { id: item.id, success: false, error: error.message };
      }
      
      return { id: item.id, success: true, url: placeholderUrl };
    }));
    
    console.log(`Updated ${updates.filter(u => u.success).length} out of ${media.length} media items`);
    
    return NextResponse.json({
      message: `Updated ${updates.filter(u => u.success).length} out of ${media.length} media items`,
      updates
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 