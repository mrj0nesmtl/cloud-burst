"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaActionHandler } from '@/components/media';
import { Media } from '@/types/media';
import { Skeleton } from '@/components/ui/skeleton';

export default function GuestMediaViewPage({ params }: { params: { mediaId: string } }) {
  const { mediaId } = params;
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  
  const [media, setMedia] = useState<Media | null>(null);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(true);

  useEffect(() => {
    const fetchMediaAndGallery = async () => {
      if (!token) {
        setError('Invalid invitation token');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the specific media item first
        console.log(`Fetching media with ID: ${mediaId} and token: ${token}`);
        const mediaResponse = await fetch(`/api/guest/media/${mediaId}?token=${token}`);
        
        if (!mediaResponse.ok) {
          console.error(`API response error: ${mediaResponse.status} ${mediaResponse.statusText}`);
          throw new Error(`Failed to fetch media: ${mediaResponse.status}`);
        }
        
        const mediaData = await mediaResponse.json();
        
        if (!mediaData.media) {
          throw new Error('No media data in response');
        }
        
        // Ensure the media has all required fields with good defaults
        const mediaWithDefaults: Media = {
          ...mediaData.media,
          id: mediaData.media.id,
          eventId: mediaData.media.eventId,
          type: mediaData.media.mediaType?.toLowerCase() || 'photo',
          url: mediaData.media.url || '',
          thumbnailUrl: mediaData.media.thumbnailUrl || mediaData.media.url || '',
          createdAt: mediaData.media.createdAt || new Date().toISOString(),
          width: mediaData.media.width || 800,
          height: mediaData.media.height || 600,
          isPublic: mediaData.media.isPublic ?? true,
          status: mediaData.media.status || 'active'
        };
        
        setMedia(mediaWithDefaults);
        
        // Now fetch all media for the event to enable gallery navigation
        if (mediaWithDefaults.eventId) {
          const galleryResponse = await fetch(`/api/guest/gallery?token=${token}`);
          
          if (galleryResponse.ok) {
            const galleryData = await galleryResponse.json();
            
            if (galleryData.media && Array.isArray(galleryData.media)) {
              // Process all media items with consistent fields
              const processedMedia = galleryData.media.map((item: any) => ({
                id: item.id,
                eventId: item.event_id || mediaWithDefaults.eventId,
                type: (item.media_type || 'photo').toLowerCase(),
                url: item.url || '',
                thumbnailUrl: item.thumbnail_url || item.url || '',
                title: item.title || '',
                description: item.description || '',
                createdAt: item.created_at || new Date().toISOString(),
                width: item.width || 800,
                height: item.height || 600,
                status: item.status || 'active',
                isPublic: item.is_public ?? true,
              }));
              
              setMediaList(processedMedia);
              console.log(`Loaded ${processedMedia.length} media items for gallery navigation`);
            }
          } else {
            // If gallery fetch fails, we still have our main media item
            console.warn('Could not fetch gallery media items, proceeding with single media view');
            setMediaList([mediaWithDefaults]);
          }
        } else {
          // If no event ID, just use the single media item
          setMediaList([mediaWithDefaults]);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Unable to load media. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaAndGallery();
  }, [mediaId, token]);

  const handleBack = () => {
    router.push(`/guest/gallery?token=${token}`);
  };

  const handleMediaUpdated = (updatedMedia: Media) => {
    // Update the media state with the edited data
    setMedia(updatedMedia);
    
    // Also update in the mediaList
    if (mediaList.length > 0) {
      setMediaList(mediaList.map(item => 
        item.id === updatedMedia.id ? updatedMedia : item
      ));
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        
        <div className="w-full aspect-video rounded-md overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="container py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
          <p>{error || 'Media not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* This page acts as a container and immediately opens the media viewer */}
      <div className="container py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        
        {/* Simple preview of the media */}
        <div className="aspect-video w-full max-w-4xl mx-auto bg-black/5 rounded-lg flex items-center justify-center border">
          <p className="text-center text-muted-foreground">
            Media viewer is active. Close it to return to this page.
          </p>
        </div>
      </div>
      
      {/* The MediaActionHandler manages the viewing and editing experience */}
      <MediaActionHandler
        token={token || undefined}
        media={media}
        mediaList={mediaList}
        onMediaUpdated={handleMediaUpdated}
        showEditButton={true}
      />
    </>
  );
} 