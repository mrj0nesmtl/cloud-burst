"use client"

import { useState, useEffect } from 'react'
import { Grid, LayoutGrid, Rows, SlidersHorizontal, Search, X } from 'lucide-react'

import { Media, MediaType, GalleryLayout, GallerySortOption } from '@/types/media'
import { cn } from '@/lib/utils'
import { useMediaStore } from '@/store/media-store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { MediaCard } from './MediaCard'
import { MediaLightbox } from './MediaLightbox'
import { EmptyState } from '@/components/ui/empty-state'
import { Spinner } from '@/components/ui/spinner'

interface MediaGridProps {
  mediaItems: Media[]
  isLoading?: boolean
  emptyMessage?: string
  layout?: GalleryLayout
  defaultSort?: GallerySortOption
  onLayoutChange?: (layout: GalleryLayout) => void
  showEventName?: boolean
  showApproval?: boolean
  filterByMediaType?: boolean
  showControls?: boolean
  onApprove?: (media: Media) => void
  onReject?: (media: Media) => void
  onSelect?: (media: Media) => void
  className?: string
}

/**
 * MediaGrid component displays a grid of media items with filtering and sorting options
 */
export function MediaGrid({
  mediaItems,
  isLoading = false,
  emptyMessage = "No media found",
  layout = 'grid',
  defaultSort = 'newest',
  onLayoutChange,
  showEventName = false,
  showApproval = false,
  filterByMediaType = true,
  showControls = false,
  onApprove,
  onReject,
  onSelect,
  className
}: MediaGridProps) {
  // Get layout and sorting from store
  const { 
    layout: storeLayout, 
    sortOption: storeSortOption,
    setLayout, 
    setSortOption 
  } = useMediaStore()
  
  // Local state
  const [currentLayout, setCurrentLayout] = useState<GalleryLayout>(storeLayout || layout)
  const [sortOption, setSortOptionLocal] = useState<GallerySortOption>(storeSortOption || defaultSort)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | 'all'>('all')
  const [filteredMedia, setFilteredMedia] = useState<Media[]>(mediaItems)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)
  
  // Update layout in store when local state changes
  useEffect(() => {
    setLayout(currentLayout)
    if (onLayoutChange) {
      onLayoutChange(currentLayout)
    }
  }, [currentLayout, setLayout, onLayoutChange])
  
  // Update sort option in store when local state changes
  useEffect(() => {
    setSortOption(sortOption)
  }, [sortOption, setSortOption])
  
  // Filter and sort media items when dependencies change
  useEffect(() => {
    let result = [...mediaItems]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => 
        item.filename.toLowerCase().includes(query) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Apply media type filter
    if (selectedMediaType !== 'all') {
      result = result.filter(item => item.media_type === selectedMediaType)
    }
    
    // Apply sorting
    result = sortMedia(result, sortOption)
    
    setFilteredMedia(result)
    
    // Reset selected media index if it's out of bounds
    if (selectedMediaIndex !== null && selectedMediaIndex >= result.length) {
      setSelectedMediaIndex(null)
    }
  }, [mediaItems, searchQuery, sortOption, selectedMediaType, selectedMediaIndex])
  
  // Sort media based on selected option
  const sortMedia = (items: Media[], option: GallerySortOption): Media[] => {
    const sorted = [...items]
    
    switch (option) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'name_asc':
        return sorted.sort((a, b) => a.filename.localeCompare(b.filename))
      case 'name_desc':
        return sorted.sort((a, b) => b.filename.localeCompare(a.filename))
      case 'size_asc':
        return sorted.sort((a, b) => (a.size || 0) - (b.size || 0))
      case 'size_desc':
        return sorted.sort((a, b) => (b.size || 0) - (a.size || 0))
      default:
        return sorted
    }
  }
  
  // Handle layout change
  const handleLayoutChange = (newLayout: GalleryLayout) => {
    setCurrentLayout(newLayout)
  }
  
  // Handle media selection
  const handleMediaSelect = (media: Media) => {
    const index = filteredMedia.findIndex(item => item.id === media.id)
    setSelectedMediaIndex(index >= 0 ? index : null)
  }
  
  // Close lightbox
  const handleCloseLightbox = () => {
    setSelectedMediaIndex(null)
  }
  
  // Navigate to next media in lightbox
  const handleNextMedia = () => {
    if (selectedMediaIndex === null || filteredMedia.length === 0) return
    setSelectedMediaIndex((selectedMediaIndex + 1) % filteredMedia.length)
  }
  
  // Navigate to previous media in lightbox
  const handlePrevMedia = () => {
    if (selectedMediaIndex === null || filteredMedia.length === 0) return
    setSelectedMediaIndex((selectedMediaIndex - 1 + filteredMedia.length) % filteredMedia.length)
  }
  
  // Clear search query
  const clearSearch = () => {
    setSearchQuery('')
  }
  
  // Helper functions to determine button variants
  const getButtonVariant = (layoutType: GalleryLayout): 'secondary' | 'ghost' => {
    return currentLayout === layoutType ? 'secondary' : 'ghost'
  }
  
  // Determine grid columns based on layout
  const gridColumnsClass = 
    currentLayout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' :
    currentLayout === 'masonry' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-max' :
    'grid-cols-1'
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading media...</p>
      </div>
    )
  }
  
  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search media..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {filterByMediaType && (
            <Select
              value={selectedMediaType}
              onValueChange={(value) => setSelectedMediaType(value as MediaType | 'all')}
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
          )}
          
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOptionLocal(value as GallerySortOption)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="size_asc">Size (Small-Large)</SelectItem>
              <SelectItem value="size_desc">Size (Large-Small)</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button
              variant={getButtonVariant('grid')}
              size="icon"
              className="rounded-none rounded-l-md"
              onClick={() => handleLayoutChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={getButtonVariant('masonry')}
              size="icon"
              className="rounded-none border-x"
              onClick={() => handleLayoutChange('masonry')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={getButtonVariant('filmstrip')}
              size="icon"
              className="rounded-none rounded-r-md"
              onClick={() => handleLayoutChange('filmstrip')}
            >
              <Rows className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Filter info */}
      {(searchQuery || selectedMediaType !== 'all') && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredMedia.length} of {mediaItems.length} items
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedMediaType('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {filteredMedia.length === 0 && (
        <EmptyState
          icon={<SlidersHorizontal className="h-12 w-12" />}
          title="No media found"
          description={searchQuery || selectedMediaType !== 'all' 
            ? "Try adjusting your filters or search query." 
            : emptyMessage}
          action={
            searchQuery || selectedMediaType !== 'all' ? (
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedMediaType('all')
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
      
      {/* Media grid */}
      {filteredMedia.length > 0 && (
        <>
          {currentLayout === 'filmstrip' ? (
            <div className="w-full overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                {filteredMedia.map((media) => (
                  <div key={media.id} className="w-[250px] flex-shrink-0">
                    <MediaCard
                      media={media}
                      aspectRatio={media.media_type === 'video' ? 'video' : 'portrait'}
                      onSelect={handleMediaSelect}
                      showEvent={showEventName}
                      showApproval={showApproval}
                      onApprove={showControls && onApprove ? () => onApprove(media) : undefined}
                      onReject={showControls && onReject ? () => onReject(media) : undefined}
                      showControls={showControls}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={cn(
              'grid gap-4', 
              gridColumnsClass
            )}>
              {filteredMedia.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  aspectRatio={
                    currentLayout === 'masonry' 
                      ? (media.media_type === 'video' ? 'video' : (media.width && media.height && media.width > media.height) ? 'video' : 'portrait')
                      : media.media_type === 'video' ? 'video' : 'square'
                  }
                  onSelect={handleMediaSelect}
                  showEvent={showEventName}
                  showApproval={showApproval}
                  onApprove={showControls && onApprove ? () => onApprove(media) : undefined}
                  onReject={showControls && onReject ? () => onReject(media) : undefined}
                  showControls={showControls}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Lightbox */}
      {selectedMediaIndex !== null && (
        <MediaLightbox
          media={filteredMedia[selectedMediaIndex]}
          onClose={handleCloseLightbox}
          onNext={filteredMedia.length > 1 ? handleNextMedia : undefined}
          onPrevious={filteredMedia.length > 1 ? handlePrevMedia : undefined}
          showApproval={showApproval}
        />
      )}
    </div>
  )
} 