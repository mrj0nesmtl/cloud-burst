'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { EventWithCounts } from '@/types/events'
import { EnhancedEventCard } from '@/components/events/enhanced-event-card'
import { deleteEvent, duplicateEvent } from '@/lib/supabase/events'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EventSearch } from '@/components/events/event-search'
import { EventFilters, type EventFilters as EventFiltersType } from '@/components/events/event-filters'

export function ClientSideFilters() {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="w-full sm:w-[200px]">
        <EventSearch 
          onSearch={(query) => {
            // Store search query in URL params for persistence
            const url = new URL(window.location.href);
            if (query) {
              url.searchParams.set('q', query);
            } else {
              url.searchParams.delete('q');
            }
            window.history.pushState({}, '', url);
            
            // Dispatch custom event for event list to listen to
            window.dispatchEvent(new CustomEvent('event-search', { detail: query }));
          }}
          initialQuery={typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('q') || '' : ''}
        />
      </div>
      <EventFilters 
        filters={{
          dateRange: undefined,
          statuses: [],
          isPublic: null,
        }}
        onFilterChange={(filters) => {
          // Dispatch custom event for event list to listen to
          window.dispatchEvent(new CustomEvent('event-filter', { detail: filters }));
        }}
      />
    </div>
  )
}

export function EventList({ 
  events, 
  emptyMessage = "No events found in this category."
}: { 
  events: EventWithCounts[],
  emptyMessage?: string
}) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFiltersType>({
    dateRange: undefined,
    statuses: [],
    isPublic: null,
  });
  const { toast } = useToast();
  
  // Listen for search events
  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail);
    };
    
    window.addEventListener('event-search', handleSearch as EventListener);
    
    // Initialize from URL if present
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const query = url.searchParams.get('q');
      if (query) {
        setSearchQuery(query);
      }
    }
    
    return () => {
      window.removeEventListener('event-search', handleSearch as EventListener);
    };
  }, []);
  
  // Listen for filter events
  useEffect(() => {
    const handleFilter = (e: CustomEvent<EventFiltersType>) => {
      setFilters(e.detail);
    };
    
    window.addEventListener('event-filter', handleFilter as EventListener);
    
    return () => {
      window.removeEventListener('event-filter', handleFilter as EventListener);
    };
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...events];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        event => 
          event.name.toLowerCase().includes(query) || 
          (event.description?.toLowerCase().includes(query) || false) ||
          (event.location?.toLowerCase().includes(query) || false)
      );
    }
    
    // Apply status filter
    if (filters.statuses.length > 0) {
      result = result.filter(event => filters.statuses.includes(event.status as any));
    }
    
    // Apply visibility filter
    if (filters.isPublic !== null) {
      result = result.filter(event => event.is_public === filters.isPublic);
    }
    
    // Apply date filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      result = result.filter(event => {
        const eventDate = new Date(event.date);
        
        if (filters.dateRange?.from && filters.dateRange?.to) {
          return eventDate >= filters.dateRange.from && eventDate <= filters.dateRange.to;
        } else if (filters.dateRange?.from) {
          return eventDate >= filters.dateRange.from;
        } else if (filters.dateRange?.to) {
          return eventDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }
    
    setFilteredEvents(result);
  }, [events, searchQuery, filters]);
  
  // Handle event deletion
  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      
      // Update the filtered events list
      setFilteredEvents(prev => prev.filter(event => event.id !== id));
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error deleting event",
        description: "There was an error deleting the event. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle event duplication
  const handleDuplicateEvent = async (id: string) => {
    try {
      const newEvent = await duplicateEvent(id);
      
      // Transform the returned event into EventWithCounts format
      const transformedEvent: EventWithCounts = {
        ...(newEvent.data || {}),
        attendees_count: 0,
        photos_count: 0,
        // Add other required fields with default values
        id: newEvent.data?.id || '',
        name: newEvent.data?.name || '',
        status: newEvent.data?.status || 'draft',
        date: newEvent.data?.date || new Date().toISOString(),
        is_public: newEvent.data?.is_public || false,
      };
      
      // Add the new event to the list
      setFilteredEvents(prev => [transformedEvent, ...prev]);
      
      toast({
        title: "Event duplicated",
        description: "The event has been successfully duplicated.",
      });
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast({
        title: "Error duplicating event",
        description: "There was an error duplicating the event. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (filteredEvents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-8">{emptyMessage}</p>
          <Button asChild>
            <Link href="/protected/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        maxHeight: 'calc(100vh - 280px)',
        overflowY: 'auto',
        padding: '4px',
        paddingRight: '12px'
      }}
      className="pr-2 event-grid"
    >
      {filteredEvents.map((event) => (
        <EnhancedEventCard 
          key={event.id} 
          event={event} 
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
        />
      ))}
    </div>
  )
}

export function EventListSkeleton() {
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        maxHeight: 'calc(100vh - 280px)',
        overflowY: 'auto',
        padding: '4px',
        paddingRight: '12px'
      }}
      className="pr-2 event-grid"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="flex gap-4 pt-2">
                <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/6 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 