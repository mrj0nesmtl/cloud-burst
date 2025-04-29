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
import { ConsistentGrid } from '@/components/gallery/consistent-grid'

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
      return null; // Return null, the empty state is handled by ConsistentGrid
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
        const status = getProperty(eventData, ['status', 'state']) || 'draft';
        const settings = item.settings || {};
        
        // Use the new API shape for counts
        const photoCount = typeof item.photoCount === 'number' ? item.photoCount : 0;
        const videoCount = typeof item.videoCount === 'number' ? item.videoCount : 0;
        
        return (
          <GalleryEventCard
            key={`event-${index}-${galleryId}`}
            id={galleryId}
            eventId={eventId}
            name={eventName}
            date={eventDate}
            thumbnailUrl={thumbnailUrl}
            logoUrl={logoUrl}
            photoCount={photoCount}
            videoCount={videoCount}
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
  
  // Create empty state for zero events
  const emptyState = (
    <EmptyState
      icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
      title="No events found"
      description="There are no events matching your filters."
      actions={
        <Button onClick={resetFilters} variant="outline">
          Reset Filters
        </Button>
      }
    />
  );

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

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ImageIcon className="mr-2 h-5 w-5 text-primary" />
            Event Galleries
          </div>
          <Button size="sm" asChild>
            <Link href="/protected/events/create">
              <UploadIcon className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>Manage galleries for your events</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
            {searchQuery && (
              <X 
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                onClick={clearSearch}
              />
            )}
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 flex items-center">
              <Filter className="mr-2 h-4 w-4" />
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
        
        {/* Active Filters */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <div className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-foreground">
                Search: {searchQuery}
                <button className="ml-1" onClick={clearSearch}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {statusFilter !== 'all' && (
              <div className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-foreground">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button className="ml-1" onClick={() => setStatusFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            <button
              className="inline-flex items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-0.5 text-sm font-medium transition-colors"
              onClick={resetFilters}
            >
              Reset All
            </button>
          </div>
        )}
        
        {/* Grid of Event Cards */}
        <div className="mt-6">
          <ConsistentGrid 
            isLoading={isLoading}
            emptyState={(filteredData.length === 0) ? emptyState : undefined}
          >
            {renderEvents()}
          </ConsistentGrid>
        </div>
      </CardContent>
    </Card>
  );
} 