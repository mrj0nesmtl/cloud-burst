'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define types for event data
interface Event {
  id: string;
  name: string;
  location: string | null;
  status: string;
  coordinates?: [number, number] | null;
  isApproximate: boolean;
}

// Dynamically import the Map component to avoid SSR issues
const MapComponent = dynamic(() => import('./leaflet-map').then(mod => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    </div>
  )
});

// Get status color for each event marker
const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return '#22c55e';  // green
    case 'completed': return '#3b82f6';  // blue
    case 'draft': return '#f59e0b';      // amber
    case 'cancelled': return '#ef4444';  // red
    default: return '#6b7280';           // gray
  }
};

// Helper function to geocode locations and convert them to coordinates
const geocodeLocation = async (locationString: string): Promise<[number, number] | null> => {
  if (!locationString) return null;
  
  try {
    // Use OpenStreetMap Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Generate a random coordinate for events without location data
const getRandomCoordinate = (): [number, number] => {
  // Create a random point on the globe
  // Use a constrained area to avoid extreme poles
  const lat = (Math.random() * 140 - 70); // -70 to +70 latitude
  const lng = (Math.random() * 360 - 180); // -180 to +180 longitude
  return [lat, lng];
};

export function EventsMapClientWrapper() {
  // Mobile detection with more granular breakpoints
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  
  // Fetch events from Supabase
  useEffect(() => {
    async function fetchEvents() {
      try {
        // Check user auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          console.error('User not authenticated:', userError);
          return;
        }
        
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, name, location, status')
          .eq('organizer_id', userData.user.id);
        
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          return;
        }
        
        console.log(`Fetched ${eventsData.length} events from database`);
        
        // Process events to add coordinates
        const eventsWithCoordinates = await Promise.all(
          eventsData.map(async (event) => {
            // Mock coordinates for common locations for demo purposes
            // In production, use actual geocoding or stored coordinates
            let coordinates: [number, number] | null = null;
            let isApproximate = false;
            
            // Check if location exists
            if (event.location) {
              // Common US cities with hardcoded coordinates for demo
              const locationMap: Record<string, [number, number]> = {
                'New York': [40.7128, -74.0060],
                'NYC': [40.7128, -74.0060],
                'Manhattan': [40.7831, -73.9712],
                'Los Angeles': [34.0522, -118.2437],
                'LA': [34.0522, -118.2437],
                'Chicago': [41.8781, -87.6298],
                'Houston': [29.7604, -95.3698],
                'Phoenix': [33.4484, -112.0740],
                'Philadelphia': [39.9526, -75.1652],
                'San Antonio': [29.4241, -98.4936],
                'San Diego': [32.7157, -117.1611],
                'Dallas': [32.7767, -96.7970],
                'San Francisco': [37.7749, -122.4194],
                'SF': [37.7749, -122.4194],
                'Austin': [30.2672, -97.7431],
                'Seattle': [47.6062, -122.3321],
                'Boston': [42.3601, -71.0589],
                'Las Vegas': [36.1699, -115.1398],
                'Portland': [45.5152, -122.6784],
                'Denver': [39.7392, -104.9903],
                'Washington': [38.9072, -77.0369],
                'DC': [38.9072, -77.0369],
                'Nashville': [36.1627, -86.7816],
                'Baltimore': [39.2904, -76.6122],
                'Miami': [25.7617, -80.1918],
                'Orlando': [28.5383, -81.3792],
                'Atlanta': [33.7490, -84.3880]
              };
              
              // Try to match the location to our predefined list
              const locationKey = Object.keys(locationMap).find(key => 
                event.location?.toLowerCase().includes(key.toLowerCase())
              );
              
              if (locationKey) {
                coordinates = locationMap[locationKey];
              } else {
                // If not found in our list, try to geocode using Nominatim
                // Limited to avoid rate limiting in development
                coordinates = await geocodeLocation(event.location);
              }
            }
            
            // If we still don't have coordinates, use a random position on the globe
            // and mark it as approximate
            if (!coordinates) {
              coordinates = getRandomCoordinate();
              isApproximate = true;
            }
            
            return {
              ...event,
              coordinates,
              isApproximate
            };
          })
        );
        
        // We now include ALL events, not just ones with valid coordinates
        setEvents(eventsWithCoordinates);
        console.log(`Processed ${eventsWithCoordinates.length} events for map display`);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchEvents:', error);
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [supabase]);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsSmallMobile(width < 480); // Extra small devices
      setIsMobile(width < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Set map as loaded after component mounts
    setMapLoaded(true);
    
    // Detect theme by checking for dark mode class or media query
    const detectTheme = () => {
      // Check if document has a dark class or data attribute
      const isDarkMode = 
        document.documentElement.classList.contains('dark') || 
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setTheme(isDarkMode ? 'dark' : 'light');
    };
    
    // Initial detection
    detectTheme();
    
    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class', 'data-theme'] 
    });
    
    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => detectTheme();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <Card className="w-full overflow-hidden border-0 shadow-none">
      <CardContent className="p-0">
        <div style={{
          width: '100%',
          height: isSmallMobile ? '200px' : isMobile ? '250px' : '400px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mb-3"></div>
                <div className="h-3 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Loading map...</div>
              </div>
            </div>
          ) : (
            // Only render map if client-side and has events to display
            mapLoaded && Array.isArray(events) && (
              <MapComponent 
                events={events} 
                getStatusColor={getStatusColor} 
                theme={theme}
                isMobile={isMobile}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

