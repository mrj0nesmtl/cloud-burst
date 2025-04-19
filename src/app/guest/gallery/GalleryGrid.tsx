"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Camera } from 'lucide-react';

interface Media {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  createdAt: string;
  mediaType: string;
}

interface GalleryGridProps {
  media: Media[];
  token: string;
  isLoading?: boolean;
}

export function GalleryGrid({ media, token, isLoading = false }: GalleryGridProps) {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  
  const handleImageLoad = (id: string) => {
    setLoadingImages(prev => ({ ...prev, [id]: false }));
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square relative">
              <Skeleton className="h-full w-full absolute inset-0" />
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!media.length) {
    return (
      <div className="text-center py-10">
        <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-2">No photos yet</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Be the first to add photos to this gallery
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item) => (
        <Link
          key={item.id}
          href={`/guest/media/${item.id}?token=${token}`}
          className="outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
        >
          <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
            <div className="aspect-square relative">
              {loadingImages[item.id] !== false && (
                <Skeleton className="h-full w-full absolute inset-0 z-10" />
              )}
              <Image
                src={item.thumbnailUrl || item.url}
                alt={item.title || 'Gallery image'}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onLoad={() => handleImageLoad(item.id)}
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="text-white text-xs">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
} 