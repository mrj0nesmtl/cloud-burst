'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Event location data based on events in the database
const eventLocations = [
  { 
    id: '4458ad61-b208-4034-ae06-45d097bdf081',
    name: 'Summer Music Festival', 
    location: 'Central Park, New York', 
    status: 'published',
    coordinates: [40.7812, -73.9665]
  },
  { 
    id: 'c540bd44-0e19-4d13-b71e-65b023b65de8',
    name: 'Corporate Tech Conference', 
    location: 'Convention Center, San Francisco', 
    status: 'published',
    coordinates: [37.7749, -122.4194]
  },
  { 
    id: '616a420e-e75d-4281-84fa-e631a055e4c9',
    name: 'Charity Gala Dinner', 
    location: 'Grand Hotel, Chicago', 
    status: 'completed',
    coordinates: [41.8781, -87.6298]
  },
  { 
    id: '6aadcf2a-53ff-43ee-83d5-32f12f3a9e3d',
    name: 'Product Launch Event', 
    location: 'Tech Campus, Seattle', 
    status: 'draft',
    coordinates: [47.6062, -122.3321]
  },
  { 
    id: '8527cbaf-c5c9-4733-9aec-94b1bf3e8644',
    name: 'Photography Workshop', 
    location: 'Art Gallery, Portland', 
    status: 'published',
    coordinates: [45.5152, -122.6784]
  },
  { 
    id: '8cdf645d-ea88-468b-aae2-12f4360dc677',
    name: 'Wedding Expo', 
    location: 'Wedding Venue, Los Angeles', 
    status: 'draft',
    coordinates: [34.0522, -118.2437]
  },
  { 
    id: '12ade81b-b785-4fd0-8ae5-9f701e2223c9',
    name: 'Annual Shareholder Meeting', 
    location: 'Corporate HQ, Boston', 
    status: 'cancelled',
    coordinates: [42.3601, -71.0589]
  },
  { 
    id: '328ed3f1-83e4-48f0-97d5-28a605e7931f',
    name: 'Fashion Show', 
    location: 'Fashion District, New York', 
    status: 'draft',
    coordinates: [40.7618, -73.9856]
  }
];

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

export function EventsMapClientWrapper() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Set map as loaded after component mounts
    setMapLoaded(true);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <Card className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-0">
        <div style={{
          width: '100%',
          height: isMobile ? '300px' : '400px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {mapLoaded && (
            <MapComponent 
              height={isMobile ? 300 : 400} 
              locations={eventLocations.map(event => ({
                id: event.id,
                name: event.name,
                location: event.location,
                status: event.status,
                coordinates: event.coordinates,
                color: getStatusColor(event.status)
              }))} 
            />
          )}
          
          {/* Map legend */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)',
            zIndex: 999
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Event Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { status: 'published', label: 'Active' },
                { status: 'completed', label: 'Completed' },
                { status: 'draft', label: 'Upcoming' },
                { status: 'cancelled', label: 'Cancelled' }
              ].map(item => (
                <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: getStatusColor(item.status),
                    border: '1px solid white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }} />
                  <span style={{ fontSize: '11px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 