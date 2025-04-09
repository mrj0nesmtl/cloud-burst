'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Calendar, ImageIcon, UploadIcon, Search, Filter, Check, X } from 'lucide-react'
import { GalleryEventCard } from '@/components/gallery/gallery-event-card'
import { EmptyState } from '@/components/ui/empty-state'

export default function EventGalleriesPage() {
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isWideDesktop, setIsWideDesktop] = useState(false);
  
  // Detect screen sizes for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024 && width < 1536);
      setIsWideDesktop(width >= 1536);
    };
    
    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        console.log('Fetching galleries from API...');
        const response = await fetch('/api/galleries/events');
        
        // Add logging of the raw response
        console.log('API response status:', response.status);
        
        const data = await response.json();
        // Log the full response structure to understand what we're working with
        console.log('API data structure:', JSON.stringify(data).substring(0, 200) + '...');
        
        if (response.ok) {
          // Determine the structure of the data
          if (Array.isArray(data)) {
            console.log(`Found galleries array with ${data.length} items`);
            // Log the first item structure to understand the format
            if (data.length > 0) {
              console.log('First gallery item structure:', JSON.stringify(data[0]));
            }
            setGalleryData(data);
            setFilteredData(data);
          } else if (data && data.galleries && Array.isArray(data.galleries)) {
            console.log(`Setting gallery data from nested property: ${data.galleries.length} galleries found`);
            if (data.galleries.length > 0) {
              console.log('First gallery item structure:', JSON.stringify(data.galleries[0]));
            }
            setGalleryData(data.galleries);
            setFilteredData(data.galleries);
          } else if (data && typeof data === 'object') {
            console.log('API returned object data - examining structure');
            const galleryItems = Object.values(data);
            if (Array.isArray(galleryItems) && galleryItems.length > 0) {
              console.log(`Extracted ${galleryItems.length} galleries from object`);
              console.log('First gallery item structure:', JSON.stringify(galleryItems[0]));
              setGalleryData(galleryItems);
              setFilteredData(galleryItems);
            } else {
              console.error('Could not extract gallery items from object data');
              useMockData();
            }
          } else {
            console.error('API returned unexpected data format', data);
            setError({ message: 'Unexpected data format received from server' });
            useMockData();
          }
        } else {
          console.error('API returned error', data);
          setError(data);
          useMockData();
        }
      } catch (err) {
        console.error('Error fetching galleries:', err);
        useMockData();
      } finally {
        setIsLoading(false);
      }
    }
    
    function useMockData() {
      console.log('Using mock data for development');
      
      const mockData = Array.from({ length: 12 }).map((_, index) => ({
        id: `gallery-${index}`,
        event: {
          id: `event-${index}`,
          name: `Event ${index + 1}`,
          date: new Date(Date.now() + (index * 86400000)).toISOString(),
          status: index % 3 === 0 ? 'published' : index % 3 === 1 ? 'draft' : 'completed',
          thumbnailUrl: `https://source.unsplash.com/random/800x600?event=${index}`,
          description: `This is a mock event ${index + 1} for development purposes.`
        },
        photoCount: Math.floor(Math.random() * 50) + 1,
        settings: {
          layout: index % 2 === 0 ? 'grid' : 'masonry',
          useLogoAsThumbnail: false
        }
      }));
      
      setGalleryData(mockData);
      setFilteredData(mockData);
    }
    
    fetchData();
  }, []);
  
  // Filter data based on search and status
  useEffect(() => {
    // Function to filter data
    applyFilters(searchQuery, statusFilter);
  }, [searchQuery, statusFilter, galleryData]);
  
  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    applyFilters('', statusFilter);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setFilteredData(galleryData || []);
  };
  
  // Apply filters based on search query and status
  const applyFilters = (query: string, status: string) => {
    if (!galleryData) {
      setFilteredData([]);
      return;
    }
    
    // Filter based on search query and status
    const filtered = galleryData.filter((item: any) => {
      // Get event data from different possible structures
      const event = item.event || item.event_data || item;
      const name = event.name || event.event_name || event.title || '';
      const itemStatus = event.status || event.state || 'draft';
      
      // Match search query
      const matchesQuery = query === '' || 
        name.toLowerCase().includes(query.toLowerCase());
      
      // Match status
      const matchesStatus = status === 'all' || 
        itemStatus.toLowerCase() === status.toLowerCase();
      
      return matchesQuery && matchesStatus;
    });
    
    setFilteredData(filtered);
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: isMobile ? 3 : 8 }).map((_, i) => (
      <div key={`skeleton-${i}`} className="rounded-md bg-muted/60 animate-pulse" 
        style={{ 
          height: isMobile ? '320px' : '360px',
          width: '100%' 
        }}
      ></div>
    ));
  };
  
  // Render events
  const renderEvents = () => {
    if (!filteredData || filteredData.length === 0) {
      return <div className="col-span-full text-center py-8 text-muted-foreground">No events to display</div>;
    }

    return filteredData.map((item, index) => {
      try {
        // Use a more flexible approach to extract data
        const getProperty = (obj: any, possibleKeys: string[]) => {
          for (const key of possibleKeys) {
            if (obj && obj[key] !== undefined) {
              return obj[key];
            }
          }
          return undefined;
        };
        
        // Extract ID - try various possible paths
        const galleryId = getProperty(item, ['id', 'gallery_id', 'galleryId']) || `fallback-id-${index}`;
        
        // Try to get event data from different possible locations
        const eventData = item.event || item.event_data || item;
        
        // Extract event properties with fallbacks
        const eventId = getProperty(eventData, ['id', 'event_id', 'eventId']) || galleryId;
        const eventName = getProperty(eventData, ['name', 'event_name', 'title']) || 'Unnamed Event';
        const eventDate = getProperty(eventData, ['date', 'event_date', 'eventDate', 'created_at']);
        
        // Try to use cover_image_url first, then check other possible thumbnail fields
        const thumbnailUrl = getProperty(eventData, ['cover_image_url', 'thumbnailUrl', 'thumbnail_url', 'image', 'coverImage']);
        const logoUrl = getProperty(eventData, ['logo_url', 'logoUrl', 'logo']);
        const photoCount = getProperty(item, ['photoCount', 'photo_count', 'count', 'total']) || 0;
        const status = getProperty(eventData, ['status', 'state']) || 'draft';
        const settings = item.settings || {};
        
        return (
          <GalleryEventCard
            key={`event-${index}-${galleryId}`}
            id={galleryId}
            eventId={eventId}
            name={eventName}
            date={eventDate}
            thumbnailUrl={thumbnailUrl}
            logoUrl={logoUrl}
            photoCount={Number(photoCount)}
            status={String(status)}
            settings={settings}
          />
        );
      } catch (error) {
        console.error(`Error rendering card for event ${index}:`, error, item);
        return (
          <Card key={`error-card-${index}`} className="flex flex-col items-center justify-center p-4 border-dashed border-red-300">
            <div className="text-destructive text-center">
              <h3 className="font-medium mb-2">Error</h3>
              <p className="text-sm text-muted-foreground">Failed to render this event</p>
            </div>
          </Card>
        );
      }
    });
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div style={{
        maxWidth: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: isMobile ? '12px' : '24px',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xl">Loading Galleries...</CardTitle>
            <CardDescription>Please wait while we load your event galleries</CardDescription>
          </CardHeader>
          <CardContent className="pb-6 px-4 sm:px-6">
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: isMobile ? '16px' : '24px',
              width: '100%'
            }}>
              {renderSkeletons()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div style={{
        maxWidth: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: isMobile ? '16px' : '24px',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 sm:p-6">
          <h1 className="text-xl font-bold text-destructive mb-3">Error Loading Galleries</h1>
          <p className="text-muted-foreground mb-4">
            There was an error loading your event galleries. Please try again later.
          </p>
          <Button asChild className="mb-4">
            <Link href="/protected/dashboard">
              Return to Dashboard
            </Link>
          </Button>
          <pre className="mt-4 p-4 bg-muted/50 rounded-md text-xs overflow-auto max-h-[200px]">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (!galleryData || galleryData.length === 0) {
    return (
      <div style={{
        maxWidth: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: isMobile ? '16px' : '24px',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No Events Found"
          description="You don't have any events yet. Create an event to get started with your gallery."
          action={
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/protected/events/create">
                Create New Event
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: isMobile ? '12px' : '24px',
      marginLeft: 'auto',
      marginRight: 'auto',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-2 space-y-1">
          <CardTitle className="text-xl">Event Galleries</CardTitle>
          <CardDescription>Browse and manage your event photo galleries</CardDescription>
        </CardHeader>
        
        <div className="px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 pb-4">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-0 sm:p-0">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center">
              <Filter className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No matching events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="pt-2 pb-8 px-4 sm:px-6">
              <div 
                className="grid gap-4 sm:gap-6"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                  overflowX: 'hidden'
                }}
              >
                {isLoading && renderSkeletons()}
                {renderEvents()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 