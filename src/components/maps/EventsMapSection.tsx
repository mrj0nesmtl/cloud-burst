'use client';

import { useState } from 'react';
import { EventMap } from './EventMap';
import { LatLngExpression } from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon, MapIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  coordinates: LatLngExpression;
}

interface EventsMapSectionProps {
  events: Event[];
  className?: string;
}

type FilterStatus = 'all' | 'draft' | 'published' | 'completed' | 'cancelled';

export function EventsMapSection({ events, className = '' }: EventsMapSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Filter events based on selected status
  const filteredEvents = selectedStatus === 'all' 
    ? events 
    : events.filter(event => event.status === selectedStatus);

  const statusFilters: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'all', label: 'All Events', color: 'bg-gray-100 hover:bg-gray-200 text-gray-800' },
    { value: 'published', label: 'Published', color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' },
    { value: 'draft', label: 'Draft', color: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
  ];

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Event Locations</CardTitle>
            <CardDescription>
              View and filter event locations by status
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            className="h-8 w-8"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {statusFilters.map(filter => (
            <Badge
              key={filter.value}
              className={cn(
                "cursor-pointer hover:opacity-90 transition-all",
                filter.color,
                selectedStatus === filter.value ? "ring-2 ring-gray-400" : ""
              )}
              onClick={() => setSelectedStatus(filter.value)}
              variant="outline"
            >
              {selectedStatus === filter.value && <CheckIcon className="mr-1 h-3 w-3" />}
              {filter.label} {filter.value !== 'all' && `(${events.filter(e => e.status === filter.value).length})`}
            </Badge>
          ))}
        </div>
        
        <EventMap 
          events={filteredEvents} 
          height={isMapExpanded ? '500px' : '300px'} 
        />
        
        <div className="mt-3 text-sm text-muted-foreground">
          <p className="flex items-center justify-between">
            <span>Showing {filteredEvents.length} event locations</span>
            {selectedStatus !== 'all' && (
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs" 
                onClick={() => setSelectedStatus('all')}
              >
                Clear filter
              </Button>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 