'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  },
  {
    id: '4',
    title: 'Forest Path',
    description: 'Peaceful walk through the forest',
    media_type: 'photo',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000',
    created_at: '2025-03-17T09:45:10.511Z',
    width: 1500,
    height: 1000
  },
  {
    id: '5',
    title: 'Ocean Waves',
    description: 'Waves crashing on the shore',
    media_type: 'video',
    url: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1566024287286-457247b70310?q=80&w=1000',
    created_at: '2025-03-16T16:20:05.511Z',
    width: 1920,
    height: 1080,
    duration: 30
  },
  {
    id: '6',
    title: 'Desert Landscape',
    description: 'Beautiful desert scenery',
    media_type: 'photo',
    url: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1000',
    created_at: '2025-03-15T11:10:43.511Z',
    width: 2000,
    height: 1333
  }
];

// Mock albums for the sidebar
const MOCK_ALBUMS = [
  { id: 'a1', name: 'Vacation 2025' },
  { id: 'a2', name: 'Family Reunion' },
  { id: 'a3', name: 'Wedding Photos' }
];

// Mock events for the sidebar
const MOCK_EVENTS = [
  { id: 'e1', name: 'Beach Party' },
  { id: 'e2', name: 'Corporate Retreat' }
];

export default function GalleryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(-1);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simulate data fetching
  useEffect(() => {
    // This would normally be an API call
    setMediaItems(MOCK_MEDIA_ITEMS);
    setFilteredItems(MOCK_MEDIA_ITEMS);
  }, []);

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
            id: 'current-user',
            name: 'Current User',
            initials: 'CU'
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

  // Handle upload action
  const handleUpload = () => {
    router.push('/protected/gallery/upload');
  };

  // Handle navigation from sidebar
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <GalleryLayout
      header={
        <GalleryHeader
          title="My Gallery"
          isOrganizer={true}
          onUpload={handleUpload}
          onFilterChange={handleFilterChange}
        />
      }
      sidebar={
        <GallerySidebar
          isOrganizer={true}
          albums={MOCK_ALBUMS}
          events={MOCK_EVENTS}
          onNavigate={handleNavigation}
        />
      }
      isPublic={false} // Set to false to keep sidebar functionality for logged-in users
    >
      <MasonryGrid
        items={filteredItems}
        onItemClick={handleMediaClick}
        showComments={true}
        onAddComment={handleAddComment}
        onLike={handleLike}
        isPublic={isMobile} // Treat as "public" view on mobile for simpler display
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