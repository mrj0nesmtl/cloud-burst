'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EventsMapClientWrapper() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mock location data
  const locations = [
    { id: 'loc1', name: 'Central Park', status: 'completed', lat: 40.7812, lng: -73.9665 },
    { id: 'loc2', name: 'Convention Center', status: 'active', lat: 37.7749, lng: -122.4194 },
    { id: 'loc3', name: 'Grand Hotel', status: 'upcoming', lat: 41.8781, lng: -87.6298 },
    { id: 'loc4', name: 'Tech Campus', status: 'cancelled', lat: 47.6062, lng: -122.3321 },
  ];
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#3b82f6'; // blue
      case 'active': return '#22c55e';    // green
      case 'upcoming': return '#f59e0b';  // amber
      case 'cancelled': return '#ef4444'; // red
      default: return '#6b7280';          // gray
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Card style={{
        width: '100%',
        height: isMobile ? '300px' : '400px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-medium">Event Locations</CardTitle>
        </CardHeader>
        <CardContent style={{
          padding: '0',
          flex: '1',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Placeholder for map */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
            backgroundSize: '20px 20px',
            backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
            position: 'relative'
          }}>
            {/* Location markers */}
            {locations.map((location) => (
              <div
                key={location.id}
                style={{
                  position: 'absolute',
                  top: `${Math.random() * 70 + 10}%`,
                  left: `${Math.random() * 70 + 10}%`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(location.status),
                  border: '2px solid white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
                title={location.name}
              />
            ))}
          </div>
          
          {/* Message at bottom of map */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '8px 16px',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTop: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--muted-foreground)'
          }}>
            Map data will be available soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 