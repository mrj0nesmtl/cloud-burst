'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModerationCard } from '@/components/media/ModerationCard';

interface Media {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  event_name?: string;
  event_id: string;
}

interface ModeratorClientProps {
  pendingMedia: Media[];
}

export function ModeratorClient({ pendingMedia }: ModeratorClientProps) {
  const router = useRouter();
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  
  const handleSuccess = (mediaId: string) => {
    setProcessedIds(prev => new Set([...prev, mediaId]));
    
    // Refresh the page data after a short delay
    setTimeout(() => {
      router.refresh();
    }, 500);
  };
  
  // Filter out already processed media items
  const filteredMedia = pendingMedia.filter(media => !processedIds.has(media.id));
  
  return (
    // Optimized for iPad - using 2 columns for most tablet sizes instead of 3
    // This ensures each card gets adequate width
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
      {filteredMedia.map((media) => (
        <ModerationCard 
          key={media.id} 
          media={media}
          onSuccess={() => handleSuccess(media.id)}
        />
      ))}
    </div>
  );
} 