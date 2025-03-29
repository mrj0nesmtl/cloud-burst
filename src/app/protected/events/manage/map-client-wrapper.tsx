'use client';

import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { mockEventLocations } from '@/components/maps/mock-data';

export function EventsMapClientWrapper() {
  return (
    <Card className="overflow-hidden border shadow-sm h-full">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-base font-medium">Event Locations</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>View and filter event locations by status</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative h-[260px] bg-muted/20">
        {/* Map placeholder - will be replaced with actual Leaflet map */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="w-full h-full relative overflow-hidden rounded-md bg-card border border-border">
            {/* Montreal-like map placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-80"></div>
            
            {/* Map grid lines */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-gray-700/30"></div>
              ))}
            </div>
            
            {/* Location markers */}
            {mockEventLocations.map((location, index) => (
              <div 
                key={index}
                className={`absolute w-3 h-3 rounded-full flex items-center justify-center 
                  ${location.status === 'completed' ? 'bg-blue-500/80' : 
                    location.status === 'active' ? 'bg-green-500/80' : 
                    location.status === 'upcoming' ? 'bg-amber-500/80' : 'bg-red-500/80'}`}
                style={{
                  // Random positions for the mockup
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + ((index % 3) * 20)}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 4px rgba(255,255,255,0.1)'
                }}
              >
              </div>
            ))}
            
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white bg-black/30 px-2 py-1 rounded-md">
              <MapPin className="h-3 w-3" /> Map data coming soon
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 