'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Heart, Download, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhotoItem {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  tags?: string[];
  dateUploaded?: string;
  views?: number;
  likes?: number;
  downloads?: number;
  featured?: boolean;
}

interface EventGalleryProps {
  eventId: string;
  eventName: string;
  photos: PhotoItem[];
}

export function EventGallery({ eventId, eventName, photos }: EventGalleryProps) {
  const [view, setView] = useState<'grid' | 'masonry'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  
  const featuredPhotos = photos.filter(photo => photo.featured);
  const recentPhotos = [...photos].sort((a, b) => {
    if (!a.dateUploaded || !b.dateUploaded) return 0;
    return new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime();
  });
  
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No photos yet</h3>
        <p className="text-muted-foreground mb-6">
          There are no photos in this gallery yet. Upload some photos to get started.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Photos ({photos.length})</TabsTrigger>
            {featuredPhotos.length > 0 && (
              <TabsTrigger value="featured">Featured ({featuredPhotos.length})</TabsTrigger>
            )}
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Badge variant="outline" className="cursor-pointer" onClick={() => setView('grid')}>
              Grid
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setView('masonry')}>
              Masonry
            </Badge>
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <PhotoGrid photos={photos} view={view} onPhotoClick={setSelectedPhoto} />
        </TabsContent>
        
        <TabsContent value="featured" className="mt-0">
          <PhotoGrid photos={featuredPhotos} view={view} onPhotoClick={setSelectedPhoto} />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <PhotoGrid photos={recentPhotos} view={view} onPhotoClick={setSelectedPhoto} />
        </TabsContent>
      </Tabs>
      
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </div>
  );
}

interface PhotoGridProps {
  photos: PhotoItem[];
  view: 'grid' | 'masonry';
  onPhotoClick: (photo: PhotoItem) => void;
}

function PhotoGrid({ photos, view, onPhotoClick }: PhotoGridProps) {
  if (view === 'masonry') {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="break-inside-avoid mb-4 cursor-pointer transform transition hover:scale-[1.01]"
            onClick={() => onPhotoClick(photo)}
          >
            <Card className="overflow-hidden">
              <div className="relative">
                <Image 
                  src={photo.thumbnail || photo.url} 
                  alt={photo.title}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover"
                />
                {photo.featured && (
                  <Badge className="absolute top-2 right-2 bg-amber-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <CardFooter className="p-2 flex justify-between">
                <span className="text-sm truncate">{photo.title}</span>
                <div className="flex gap-2 text-muted-foreground">
                  <span className="flex items-center text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    {photo.views || 0}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card 
          key={photo.id} 
          className="overflow-hidden cursor-pointer transform transition hover:scale-[1.01]"
          onClick={() => onPhotoClick(photo)}
        >
          <div className="relative aspect-[4/3]">
            <Image 
              src={photo.thumbnail || photo.url} 
              alt={photo.title} 
              fill
              className="object-cover"
            />
            {photo.featured && (
              <Badge className="absolute top-2 right-2 bg-amber-500">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <CardFooter className="p-2 flex justify-between">
            <span className="text-sm truncate">{photo.title}</span>
            <div className="flex gap-2 text-muted-foreground">
              <span className="flex items-center text-xs">
                <Eye className="h-3 w-3 mr-1" />
                {photo.views || 0}
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

interface PhotoModalProps {
  photo: PhotoItem;
  onClose: () => void;
}

function PhotoModal({ photo, onClose }: PhotoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background rounded-md max-w-4xl w-[90%] max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">{photo.title}</h3>
          <button onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="relative w-full h-[60vh]">
          <Image 
            src={photo.url} 
            alt={photo.title}
            fill
            className="object-contain"
          />
        </div>
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm">{photo.description}</p>
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {photo.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-4 text-muted-foreground">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {photo.views || 0}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {photo.likes || 0}
              </span>
              <span className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {photo.downloads || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 