'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedModerationCard } from '@/components/media/EnhancedModerationCard';
import { ConsistentGrid } from '@/components/gallery/consistent-grid';
import { ImageIcon } from 'lucide-react';
import { BatchSelectionProvider } from '@/components/moderation/BatchSelectionProvider';
import { BatchActionControls } from '@/components/moderation/BatchActionControls';

interface Media {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  event_name?: string;
  event_id: string;
  status: string;
  moderation_reason?: string;
  moderated_at?: string;
  moderated_by?: string;
}

interface EnhancedModeratorClientProps {
  mediaItems: Media[];
  tabId: string;
}

export function EnhancedModeratorClient({ mediaItems, tabId }: EnhancedModeratorClientProps) {
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
  const filteredMedia = mediaItems.filter(media => !processedIds.has(media.id));
  
  // Reset processed IDs when tab changes
  useEffect(() => {
    setProcessedIds(new Set());
  }, [tabId]);
  
  // Empty state component
  const emptyState = (
    <div className="w-full p-8 text-center">
      <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
      <p className="text-muted-foreground text-lg">No media items to display</p>
    </div>
  );
  
  return (
    <BatchSelectionProvider>
      <div className="space-y-6">
        <BatchActionControls 
          mediaItems={filteredMedia} 
          onActionComplete={() => router.refresh()} 
        />
        
        <ConsistentGrid 
          isLoading={isLoading}
          emptyState={filteredMedia.length === 0 ? emptyState : undefined}
          columns={{
            default: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4
          }}
        >
          {filteredMedia.map((media) => (
            <div key={media.id} className="h-full">
              <EnhancedModerationCard 
                media={media}
                onSuccess={() => handleSuccess(media.id)}
                selectable={true}
              />
            </div>
          ))}
        </ConsistentGrid>
      </div>
    </BatchSelectionProvider>
  );
} 