'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryHeader, MediaViewer, MediaItem } from '@/components/gallery';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { MediaType } from '@/types/media';
import { ConsistentGrid } from '@/components/gallery/consistent-grid';
import { Card, CardContent } from '@/components/ui/card';
import { MediaCard } from '@/components/gallery/MediaCard';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<{id: string, name: string}[]>([]);
  const [albums, setAlbums] = useState<{id: string, name: string}[]>([]);
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

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClientComponentClient<Database>();
        
        // Fetch events the user has access to
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, name')
          .order('created_at', { ascending: false });
        
        if (eventsError) throw eventsError;
        
        // Fetch albums
        const { data: albumsData, error: albumsError } = await supabase
          .from('albums')
          .select('id, title')
          .order('created_at', { ascending: false });
        
        if (albumsError) throw albumsError;
        
        // Fetch user's media from all events
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('*')
            .eq('uploaded_by', userData.user.id)
            .order('created_at', { ascending: false });
          
          if (mediaError) throw mediaError;
          
          // Map db media to MediaItem format expected by components
          const mappedMedia = mediaData.map(item => ({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            media_type: item.media_type as 'photo' | 'video',
            url: item.url,
            thumbnail_url: item.thumbnail_url,
            created_at: item.created_at,
            width: item.width || 800,
            height: item.height || 600,
            duration: item.media_type === 'video' ? 
              (item.metadata?.video?.duration || 0) : undefined,
            comments: []
          }));
          
          setMediaItems(mappedMedia);
          setFilteredItems(mappedMedia);
        }
        
        // Set events and albums
        setEvents(eventsData?.map(e => ({ id: e.id, name: e.name })) || []);
        setAlbums(albumsData?.map(a => ({ id: a.id, name: a.title })) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load gallery data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
  const handleLike = async (mediaId: string) => {
    try {
      const supabase = createClientComponentClient<Database>();
      
      // Toggle like status in database
      // This is a simplified implementation
      await supabase.from('media_likes').insert({
        media_id: mediaId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'Liked!',
        description: 'You liked this media.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error liking media:', error);
      toast({
        title: 'Error',
        description: 'Failed to like media.',
        variant: 'destructive',
      });
    }
  };

  // Handle comment action
  const handleAddComment = async (mediaId: string, comment: string) => {
    try {
      const supabase = createClientComponentClient<Database>();
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) throw new Error('User not authenticated');
      
      // Add comment to database
      const { data, error } = await supabase.from('media_comments').insert({
        media_id: mediaId,
        user_id: user.id,
        comment: comment
      });
      
      if (error) throw error;
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been added.',
        duration: 3000,
      });
      
      // Update the local state with the new comment
      const updatedItems = mediaItems.map(item => {
        if (item.id === mediaId) {
          const newComment = {
            id: `c${Date.now()}`,
            text: comment,
            author: {
              id: user.id,
              name: user.email || 'User',
              initials: (user.email || 'U').charAt(0).toUpperCase()
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
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment.',
        variant: 'destructive',
      });
    }
  };

  // Handle upload action
  const handleUpload = () => {
    router.push('/protected/gallery/upload');
  };

  // Handle navigation from sidebar
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Render main gallery content
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">My Gallery</h2>
          <p className="text-sm text-muted-foreground">
            Manage your photos and videos across all events
          </p>
        </div>
        
        <Button onClick={handleUpload} className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('all')}
        >
          All
        </Button>
        <Button
          variant={activeFilter === 'photo' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('photo')}
        >
          Photos
        </Button>
        <Button
          variant={activeFilter === 'video' ? 'default' : 'outline'}
          onClick={() => handleFilterChange('video')}
        >
          Videos
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No media found</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            You don't have any {activeFilter !== 'all' ? activeFilter + ' ' : ''}media yet. 
            Upload your first file to get started.
          </p>
          <Button onClick={handleUpload}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      ) : (
        <ConsistentGrid className="gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden bg-background">
              <CardContent className="p-0">
                <MediaCard
                  item={item}
                  onClick={() => handleMediaClick(item)}
                  onLike={() => handleLike(item.id)}
                  onAddComment={(mediaId, comment) => handleAddComment(mediaId, comment)}
                />
              </CardContent>
            </Card>
          ))}
        </ConsistentGrid>
      )}

      {isViewerOpen && selectedMediaIndex >= 0 && (
        <MediaViewer
          items={filteredItems}
          currentIndex={selectedMediaIndex}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          onNavigate={handleViewerNavigate}
          onLike={handleLike}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
} 