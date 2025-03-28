'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, ImageIcon } from 'lucide-react'
import { GalleryEventCard } from '@/components/gallery/gallery-event-card'
import { EmptyState } from '@/components/ui/empty-state'

export default function EventGalleriesPage() {
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Detect viewport size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/galleries/events');
        const data = await response.json();
        if (response.ok) {
          setGalleryData(data);
        } else {
          setError(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Get grid columns based on screen size
  const getGridStyle = () => {
    return {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
      gap: isMobile ? '16px' : '24px',
      width: '100%',
      maxWidth: '100%'
    };
  };
  
  if (isLoading) {
    return (
      <div style={{ width: '100%', padding: '24px' }}>
        <Card>
          <CardHeader>
            <CardTitle>Loading Galleries...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ width: '100%', padding: '24px' }}>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
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
  
  if (!galleryData || galleryData.length === 0) {
    return (
      <div style={{ width: '100%', padding: '24px' }}>
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No Events Found"
          description="You don't have any events yet. Create an event to get started with your gallery."
          action={
            <Button size="lg" asChild>
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
    <div style={{ width: '100%', padding: '24px' }}>
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center text-2xl">
            <Calendar className="mr-3 h-6 w-6 text-primary" />
            Event Galleries
          </CardTitle>
          <CardDescription className="text-base">
            {galleryData.length > 0
              ? `Manage galleries for ${galleryData.length} ${galleryData.length === 1 ? 'event' : 'events'}`
              : 'No event galleries found'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button asChild>
              <Link href="/protected/gallery/upload?eventId=recent">
                Upload Media
              </Link>
            </Button>
          </div>
          <div style={getGridStyle()}>
            {galleryData.map((item) => (
              <div key={item.gallery.id} style={{ width: '100%' }}>
                <GalleryEventCard
                  id={item.gallery.id}
                  eventId={item.event.id}
                  name={item.event.name || "Unnamed Event"}
                  date={item.event.date}
                  thumbnailUrl={item.event.cover_image_url}
                  logoUrl={item.event.logo_url}
                  photoCount={item.photoCount || 0}
                  status={item.event.status || "draft"}
                  settings={item.gallery.settings || { layout: 'grid' }}
                  organizerId={item.event.organizer_id}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 