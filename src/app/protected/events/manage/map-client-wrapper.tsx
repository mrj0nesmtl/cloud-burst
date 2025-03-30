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
    <Card className="w-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-0">
        <div style={{
          width: '100%',
          height: isMobile ? '300px' : '400px',
          position: 'relative',
          background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
          backgroundSize: '20px 20px',
          backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
          overflow: 'hidden'
        }}>
          {/* Location markers */}
          {locations.map((location) => (
            <div
              key={location.id}
              style={{
                position: 'absolute',
                top: `${Math.random() * 70 + 10}%`,
                left: `${Math.random() * 70 + 10}%`,
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(location.status),
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                transition: 'all 0.2s ease'
              }}
              title={location.name}
            />
          ))}
          
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
            zIndex: 20
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Event Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { status: 'completed', label: 'Completed' },
                { status: 'active', label: 'Active' },
                { status: 'upcoming', label: 'Upcoming' },
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
          
          {/* Message at bottom of map */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '12px',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTop: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            backdropFilter: 'blur(4px)'
          }}>
            Interactive map coming soon with real event locations
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 