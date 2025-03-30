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
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '24px',
      width: '100%'
    }}>
      {/* Quick Stats Section - Full Width Row */}
      <div className="w-full">
        <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Quick Stats</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%'
        }}>
          <Card className="overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all bg-blue-50/50 dark:bg-blue-900/10">
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
          
          <Card className="overflow-hidden border border-green-100 dark:border-green-900/30 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800/50 transition-all bg-green-50/50 dark:bg-green-900/10">
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
          
          <Card className="overflow-hidden border border-purple-100 dark:border-purple-900/30 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/50 transition-all bg-purple-50/50 dark:bg-purple-900/10">
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
      </div>
      
      {/* Map Section - Full Width Row */}
      <div className="w-full">
        <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Event Locations</h3>
        {mapComponent}
      </div>
    </div>
  );
} 