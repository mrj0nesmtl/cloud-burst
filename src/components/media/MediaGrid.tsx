import { useState, useEffect, useRef, useCallback } from 'react';
import { MediaCard } from './MediaCard';
import { Media, MediaStatus, MediaType } from '@/types/media';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface MediaGridProps {
  media: Media[];
  isLoading?: boolean;
  selectedMedia?: Media[];
  onSelectMedia?: (media: Media) => void;
  onDeselectMedia?: (media: Media) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onApproveMedia?: (media: Media) => void;
  onRejectMedia?: (media: Media) => void;
  onDeleteMedia?: (media: Media) => void;
  onEditMedia?: (media: Media) => void;
  onViewMedia?: (media: Media) => void;
  layout?: 'grid' | 'masonry';
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  selectable?: boolean;
  showControls?: boolean;
  showStatus?: boolean;
  showToolbar?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function MediaGrid({
  media,
  isLoading = false,
  selectedMedia = [],
  onSelectMedia,
  onDeselectMedia,
  onSelectAll,
  onDeselectAll,
  onApproveMedia,
  onRejectMedia,
  onDeleteMedia,
  onEditMedia,
  onViewMedia,
  layout = 'grid',
  columns = 3,
  gap = 'md',
  selectable = false,
  showControls = false,
  showStatus = true,
  showToolbar = true,
  className,
  emptyMessage = 'No media items found'
}: MediaGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | 'all'>('all');
  const [mediaStatusFilter, setMediaStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  const containerRef = useRef<HTMLDivElement>(null);
  const [columns$, setColumns] = useState(columns);
  
  // Filter media based on search term and filters
  const filteredMedia = media.filter(item => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.storage_path && item.storage_path.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by media type
    const matchesType = mediaTypeFilter === 'all' || item.media_type === mediaTypeFilter;
    
    // Filter by status
    const matchesStatus = mediaStatusFilter === 'all' || item.status === mediaStatusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Sort media
  const sortedMedia = [...filteredMedia].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return (a.title || a.storage_path).localeCompare(b.title || b.storage_path);
      case 'size':
        return (b.size || 0) - (a.size || 0);
      default:
        return 0;
    }
  });
  
  // Handle responsive columns
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      
      if (containerWidth < 640) {
        setColumns(1);
      } else if (containerWidth < 768) {
        setColumns(2);
      } else if (containerWidth < 1024) {
        setColumns(3);
      } else if (containerWidth < 1280) {
        setColumns(4);
      } else {
        setColumns(columns);
      }
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    
    return () => {
      window.removeEventListener('resize', updateColumns);
    };
  }, [columns]);
  
  // Determine if a media item is selected
  const isSelected = useCallback((media: Media) => {
    return selectedMedia.some(selected => selected.id === media.id);
  }, [selectedMedia]);
  
  // Handle media selection
  const handleSelectMedia = useCallback((media: Media) => {
    if (isSelected(media)) {
      onDeselectMedia?.(media);
    } else {
      onSelectMedia?.(media);
    }
  }, [isSelected, onDeselectMedia, onSelectMedia]);
  
  // Get gap class based on gap prop
  const getGapClass = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'sm':
        return 'gap-2';
      case 'lg':
        return 'gap-6';
      case 'md':
      default:
        return 'gap-4';
    }
  };
  
  // Generate grid classes
  const gridClasses = cn(
    'grid',
    layout === 'grid' ? [
      columns$ === 1 && 'grid-cols-1',
      columns$ === 2 && 'grid-cols-2',
      columns$ === 3 && 'grid-cols-3',
      columns$ === 4 && 'grid-cols-4',
      columns$ === 5 && 'grid-cols-5',
      columns$ === 6 && 'grid-cols-6',
    ] : 'grid-cols-1 md:grid-cols-3',
    getGapClass(),
    className
  );

  return (
    <div className="w-full flex flex-col space-y-4">
      {showToolbar && (
        <div className="flex flex-col md:flex-row justify-between gap-2 p-2 bg-accent/30 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-64">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select 
              value={mediaTypeFilter} 
              onValueChange={(value) => setMediaTypeFilter(value as MediaType | 'all')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Media Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={MediaType.PHOTO}>Photos</SelectItem>
                <SelectItem value={MediaType.VIDEO}>Videos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={mediaStatusFilter} 
              onValueChange={(value) => setMediaStatusFilter(value as MediaStatus | 'all')}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={MediaStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={MediaStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={MediaStatus.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'name' | 'size')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
            
            {selectable && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSelectAll}
                  disabled={filteredMedia.length === 0}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDeselectAll}
                  disabled={selectedMedia.length === 0}
                >
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {sortedMedia.length > 0 || isLoading ? (
        <div ref={containerRef} className={gridClasses}>
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 12 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="aspect-square bg-accent/20 rounded-md overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : (
            // Media items
            sortedMedia.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                aspectRatio={layout === 'masonry' ? 'auto' : 'square'}
                selected={isSelected(item)}
                selectable={selectable}
                onSelect={handleSelectMedia}
                onApprove={onApproveMedia}
                onReject={onRejectMedia}
                onDelete={onDeleteMedia}
                onEdit={onEditMedia}
                onView={onViewMedia}
                showControls={showControls}
                showStatus={showStatus}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
} 