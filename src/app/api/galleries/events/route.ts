import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserGalleriesServer, createGalleryForEventServer } from '@/lib/supabase/galleries.server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({ error: 'Session error' }, { status: 401 });
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get all user's events first
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, name, date, cover_image_url, logo_url, status, organizer_id')
      .eq('organizer_id', session.user.id);
    
    if (eventsError) {
      console.error('API: Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    if (!events || events.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Try to get galleries
    let galleries = [];
    try {
      galleries = await getUserGalleriesServer();
    } catch (error) {
      console.error('API: Error fetching galleries, will create missing ones:', error);
      // Continue execution and create galleries as needed
    }
    
    // Create a map of existing galleries by event ID for quick lookup
    const galleryMap = new Map();
    galleries.forEach(gallery => {
      galleryMap.set(gallery.event_id, gallery);
    });
    
    // For each event, ensure it has a gallery or create one
    const galleryDataPromises = events.map(async (event) => {
      let gallery = galleryMap.get(event.id);
      
      // If no gallery exists for this event, create one
      if (!gallery) {
        try {
          gallery = await createGalleryForEventServer(event.id);
        } catch (error) {
          console.error('API: Error creating gallery for event', event.id, error);
          // Return null for events where gallery creation failed
          return null;
        }
      }
      
      // Get photo count for this gallery
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('is_approved', true);
      
      return {
        gallery,
        event,
        photoCount: count || 0
      };
    });
    
    // Wait for all gallery data to be processed
    const galleryDataResults = await Promise.all(galleryDataPromises);
    
    // Filter out null results (failed gallery creations)
    const galleryData = galleryDataResults.filter(result => result !== null);
    
    // Sort galleries by event date (newest first)
    galleryData.sort((a, b) => {
      if (!a.event?.date || !b.event?.date) return 0;
      return new Date(b.event.date).getTime() - new Date(a.event.date).getTime();
    });
    
    return NextResponse.json(galleryData, { status: 200 });
    
  } catch (error) {
    console.error('API: Unexpected error in galleries/events route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 