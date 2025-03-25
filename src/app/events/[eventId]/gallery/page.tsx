'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GalleryLayout, GallerySidebar, GalleryHeader, MasonryGrid, MediaViewer, MediaItem } from '@/components/gallery';
import { useToast } from '@/components/ui/use-toast';

// This would normally come from an API call
const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id: '1',
    title: 'Beach Sunset',
    description: 'Beautiful sunset at the beach',
    media_type: 'photo',
    url: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?q=80&w=1000',
    created_at: '2025-03-20T18:25:43.511Z',
    width: 1200,
    height: 800,
    comments: [
      {
        id: 'c1',
        text: 'This is gorgeous!',
        author: { id: 'u1', name: 'Jane Smith', initials: 'JS' },
        createdAt: '2025-03-21T10:30:00.000Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Mountain View',
    description: 'Scenic mountain landscape',
    media_type: 'photo',
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=1000',
    created_at: '2025-03-19T14:35:21.511Z',
    width: 800,
    height: 1200
  },
  {
    id: '3',
    title: 'City Timelapse',
    description: 'Timelapse of city traffic',
    media_type: 'video',
    url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000',
    created_at: '2025-03-18T12:15:32.511Z',
    width: 1920,
    height: 1080,
    duration: 15
  }
];

// Mock albums for the sidebar
const MOCK_ALBUMS = [
  { id: 'a1', name: 'Best Moments' },
  { id: 'a2', name: 'Group Pictures' }
];

interface PublicGalleryPageProps {
  params: {
    eventId: string;
  };
}

export default function PublicGalleryPage({ params }: PublicGalleryPageProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(-1);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [eventTitle, setEventTitle] = useState('Loading event...');
  const { toast } = useToast();
  const { eventId } = params;

  // Simulate data fetching
  useEffect(() => {
    // This would normally be an API call with the eventId
    console.log(`Fetching media for event: ${eventId}`);
    
    // Simulate delay
    const timer = setTimeout(() => {
      setMediaItems(MOCK_MEDIA_ITEMS);
      setFilteredItems(MOCK_MEDIA_ITEMS);
      setEventTitle('Beach Party 2025');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [eventId]);

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredItems(mediaItems);
    } else {
      const filtered = mediaItems.filter(item => item.media_type === filter);
      setFilteredItems(filtered);
    }
  };

  // Handle media item click
  const handleMediaClick = (item: MediaItem) => {
    const index = filteredItems.findIndex(media => media.id === item.id);
    if (index !== -1) {
      setSelectedMediaIndex(index);
      setIsViewerOpen(true);
    }
  };

  // Handle viewer navigation
  const handleViewerNavigate = (index: number) => {
    setSelectedMediaIndex(index);
  };

  // Handle like action
  const handleLike = (mediaId: string) => {
    // This would normally be an API call
    toast({
      title: 'Liked!',
      description: 'You liked this media.',
      duration: 3000,
    });
  };

  // Handle comment action
  const handleAddComment = (mediaId: string, comment: string) => {
    // This would normally be an API call
    toast({
      title: 'Comment added',
      description: 'Your comment has been added.',
      duration: 3000,
    });
    
    // Update the local state with the new comment (this is just for demo)
    const updatedItems = mediaItems.map(item => {
      if (item.id === mediaId) {
        const newComment = {
          id: `c${Date.now()}`,
          text: comment,
          author: {
            id: 'guest',
            name: 'Guest User',
            initials: 'GU'
          },
          createdAt: new Date().toISOString()
        };
        
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        };
      }
      return item;
    });
    
    setMediaItems(updatedItems);
    setFilteredItems(
      activeFilter === 'all' 
        ? updatedItems 
        : updatedItems.filter(item => item.media_type === activeFilter)
    );
  };

  return (
    <GalleryLayout
      header={
        <GalleryHeader
          title={eventTitle}
          isOrganizer={false}
          onFilterChange={handleFilterChange}
        />
      }
      sidebar={
        <GallerySidebar
          isOrganizer={false}
          albums={MOCK_ALBUMS}
        />
      }
      isPublic={true}
    >
      <MasonryGrid
        items={filteredItems}
        onItemClick={handleMediaClick}
        showComments={true}
        isPublic={true}
        onAddComment={handleAddComment}
        onLike={handleLike}
      />
      
      {isViewerOpen && selectedMediaIndex >= 0 && (
        <MediaViewer
          items={filteredItems}
          currentIndex={selectedMediaIndex}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onNavigate={handleViewerNavigate}
          showComments={true}
          onAddComment={handleAddComment}
          onLike={handleLike}
        />
      )}
    </GalleryLayout>
  );
} 