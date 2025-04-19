'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModerationCard } from '@/components/media/ModerationCard';
import { ConsistentGrid } from '@/components/gallery/consistent-grid';
import { ImageIcon } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSuccess = (mediaId: string) => {
    setProcessedIds(prev => new Set([...prev, mediaId]));
    
    // Refresh the page data after a short delay
    setTimeout(() => {
      router.refresh();
    }, 500);
  };
  
  // Filter out already processed media items
  const filteredMedia = pendingMedia.filter(media => !processedIds.has(media.id));
  
  // Empty state component
  const emptyState = (
    <div className="w-full p-8 text-center">
      <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
      <p className="text-muted-foreground text-lg">No pending media items to moderate</p>
    </div>
  );
  
  return (
    <ConsistentGrid 
      isLoading={isLoading}
      emptyState={filteredMedia.length === 0 ? emptyState : undefined}
    >
      {filteredMedia.map((media) => (
        <div key={media.id} className="h-full">
          <ModerationCard 
            media={media}
            onSuccess={() => handleSuccess(media.id)}
          />
        </div>
      ))}
    </ConsistentGrid>
  );
} 