'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Activity, Users } from 'lucide-react';

interface StatsMapWrapperProps {
  processedEvents: any[]; 
  publishedEvents: any[]; 
  attendeeCounts: Record<string, number>;
  mapComponent: React.ReactNode;
}

export function StatsMapWrapper({ 
  processedEvents, 
  publishedEvents, 
  attendeeCounts, 
  mapComponent
}: StatsMapWrapperProps) {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      gap: '24px',
      width: '100%'
    }}>
      {/* Quick Stats Section - First */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        padding: '16px',
        backgroundColor: 'var(--card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        width: '100%'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Quick Stats</h3>
        
        <Card className="overflow-hidden shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Total Events</CardTitle>
            <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{processedEvents.length}</div>
            <p className="text-sm text-muted-foreground">Events created</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Active Events</CardTitle>
            <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{publishedEvents.length}</div>
            <p className="text-sm text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base font-medium">Total Attendees</CardTitle>
            <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Object.values(attendeeCounts).reduce((total, count) => total + count, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Event participants</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Map Section - Second */}
      <div style={{ width: '100%' }}>
        {mapComponent}
      </div>
    </div>
  );
} 