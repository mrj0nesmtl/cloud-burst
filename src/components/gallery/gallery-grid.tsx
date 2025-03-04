"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Photo } from '@/types/events'
import { usePhotosStore } from '@/store/photos-store'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PhotoLightbox } from './photo-lightbox'
import { formatFileSize, formatDateTime } from '@/lib/utils'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Grid, 
  LayoutGrid, 
  Rows, 
  SlidersHorizontal, 
  Search, 
  X, 
  Calendar, 
  ArrowUpDown, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Tag
} from 'lucide-react'

export type GalleryLayout = 'grid' | 'masonry' | 'slideshow'
export type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'size_asc' | 'size_desc'

interface GalleryGridProps {
  photos: Photo[]
  isLoading?: boolean
  emptyMessage?: string
  layout?: GalleryLayout
  defaultSort?: SortOption
  onLayoutChange?: (layout: GalleryLayout) => void
}

export function GalleryGrid({ 
  photos, 
  isLoading = false, 
  emptyMessage = "No photos found",
  layout = 'grid',
  defaultSort = 'newest',
  onLayoutChange
}: GalleryGridProps) {
  // State
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [currentLayout, setCurrentLayout] = useState<GalleryLayout>(layout)
  const [sortOption, setSortOption] = useState<SortOption>(defaultSort)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos)
  const [isPlaying, setIsPlaying] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // New state for tags
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Get photo URL from store
  const getPhotoPublicUrl = usePhotosStore(state => state.getPhotoPublicUrl)
  
  // Extract all unique tags from photos
  useEffect(() => {
    const tags = new Set<string>()
    
    photos.forEach(photo => {
      if (photo.metadata?.tags && Array.isArray(photo.metadata.tags)) {
        photo.metadata.tags.forEach((tag: string) => {
          tags.add(tag)
        })
      }
    })
    
    setAvailableTags(Array.from(tags).sort())
  }, [photos])
  
  // Filter and sort photos when dependencies change
  useEffect(() => {
    let result = [...photos]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(photo => 
        photo.filename.toLowerCase().includes(query)
      )
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      result = result.filter(photo => {
        const photoTags = photo.metadata?.tags || []
        return selectedTags.some(tag => photoTags.includes(tag))
      })
    }
    
    // Apply sorting
    result = sortPhotos(result, sortOption)
    
    setFilteredPhotos(result)
    
    // Reset slide index if needed
    if (slideIndex >= result.length) {
      setSlideIndex(0)
    }
  }, [photos, searchQuery, sortOption, slideIndex, selectedTags])
  
  // Handle slideshow
  useEffect(() => {
    if (currentLayout === 'slideshow' && isPlaying && filteredPhotos.length > 0) {
      slideshowTimerRef.current = setInterval(() => {
        setSlideIndex(prev => (prev + 1) % filteredPhotos.length)
      }, 5000) // Change slide every 5 seconds
    }
    
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current)
      }
    }
  }, [currentLayout, isPlaying, filteredPhotos.length])
  
  // Sort photos based on selected option
  const sortPhotos = (photosToSort: Photo[], option: SortOption): Photo[] => {
    const sorted = [...photosToSort]
    
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
    if (onLayoutChange) {
      onLayoutChange(newLayout)
    }
    
    // If switching to slideshow, pause initially
    if (newLayout === 'slideshow') {
      setIsPlaying(false)
    }
  }
  
  // Handle photo click to open lightbox
  const handlePhotoClick = (index: number) => {
    if (currentLayout !== 'slideshow') {
    setSelectedPhotoIndex(index)
    }
  }
  
  // Close the lightbox
  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null)
  }
  
  // Navigate to next photo in lightbox
  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null || filteredPhotos.length === 0) return
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length)
  }
  
  // Navigate to previous photo in lightbox
  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null || filteredPhotos.length === 0) return
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length)
  }
  
  // Handle slideshow controls
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const goToNextSlide = () => {
    setSlideIndex(prev => (prev + 1) % filteredPhotos.length)
  }
  
  const goToPrevSlide = () => {
    setSlideIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length)
  }
  
  // Clear search query
  const clearSearch = () => {
    setSearchQuery('')
  }
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }
  
  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([])
  }
  
  // Helper functions to determine button variants
  const getButtonVariant = (layoutType: GalleryLayout): 'secondary' | 'ghost' => {
    return currentLayout === layoutType ? 'secondary' : 'ghost'
  }
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={`skeleton-${index}`} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  // Render empty state
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-center">{emptyMessage}</p>
      </div>
    )
  }
  
  // Render filtered empty state
  if (filteredPhotos.length === 0 && photos.length > 0) {
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search photos..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Layout and Sort Controls */}
          <div className="flex items-center gap-2">
            {/* Tag Filter Dropdown */}
            {availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span className="hidden sm:inline">Tags</span>
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {availableTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedTags.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearTags} className="justify-center text-muted-foreground">
                        Clear all tags
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOption('newest')}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('oldest')}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('name_asc')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('name_desc')}>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('size_asc')}>
                  Size (Smallest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('size_desc')}>
                  Size (Largest)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex border rounded-md">
              <Button
                variant={getButtonVariant('grid')}
                size="icon"
                className="h-9 w-9 rounded-none rounded-l-md"
                onClick={() => handleLayoutChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={getButtonVariant('masonry')}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => handleLayoutChange('masonry')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={getButtonVariant('slideshow')}
                size="icon"
                className="h-9 w-9 rounded-none rounded-r-md"
                onClick={() => handleLayoutChange('slideshow')}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">No photos match your search criteria</p>
          <Button variant="link" onClick={clearSearch} className="mt-2">
            Clear search
          </Button>
        </div>
      </div>
    )
  }
  
  // Render slideshow view
  if (currentLayout === 'slideshow' && filteredPhotos.length > 0) {
    const currentPhoto = filteredPhotos[slideIndex]
    
    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search photos..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Layout and Sort Controls */}
          <div className="flex items-center gap-2">
            {/* Tag Filter Dropdown */}
            {availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span className="hidden sm:inline">Tags</span>
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {availableTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedTags.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearTags} className="justify-center text-muted-foreground">
                        Clear all tags
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOption('newest')}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('oldest')}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('name_asc')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('name_desc')}>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('size_asc')}>
                  Size (Smallest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('size_desc')}>
                  Size (Largest)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex border rounded-md">
              <Button
                variant={getButtonVariant('grid')}
                size="icon"
                className="h-9 w-9 rounded-none rounded-l-md"
                onClick={() => handleLayoutChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={getButtonVariant('masonry')}
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => handleLayoutChange('masonry')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={getButtonVariant('slideshow')}
                size="icon"
                className="h-9 w-9 rounded-none rounded-r-md"
                onClick={() => handleLayoutChange('slideshow')}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Slideshow */}
        <div className="relative aspect-video bg-black/10 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={getPhotoPublicUrl(currentPhoto)}
              alt={currentPhoto.filename}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-contain"
              priority
            />
          </div>
          
          {/* Slideshow Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={goToPrevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={goToNextSlide}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <span className="text-xs text-white">
              {slideIndex + 1} / {filteredPhotos.length}
            </span>
          </div>
          
          {/* Photo Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-sm text-white truncate">{currentPhoto.filename}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-white/80">{formatFileSize(currentPhoto.size || 0)}</p>
              <span className="text-white/50">•</span>
              <p className="text-xs text-white/80">{formatDateTime(currentPhoto.created_at)}</p>
            </div>
          </div>
        </div>
        
        {/* Thumbnails */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 mt-4">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative aspect-square cursor-pointer rounded-md overflow-hidden ${
                index === slideIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSlideIndex(index)}
            >
              <Image
                src={getPhotoPublicUrl(photo)}
                alt={photo.filename}
                fill
                sizes="(max-width: 640px) 16vw, (max-width: 768px) 12vw, (max-width: 1024px) 10vw, 8vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // Render grid or masonry layout
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search photos..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1.5 h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Layout and Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Tag Filter Dropdown */}
          {availableTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Tags</span>
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {availableTags.map(tag => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedTags.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearTags} className="justify-center text-muted-foreground">
                      Clear all tags
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOption('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('name_asc')}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('name_desc')}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('size_asc')}>
                Size (Smallest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('size_desc')}>
                Size (Largest)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex border rounded-md">
            <Button
              variant={getButtonVariant('grid')}
              size="icon"
              className="h-9 w-9 rounded-none rounded-l-md"
              onClick={() => handleLayoutChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={getButtonVariant('masonry')}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => handleLayoutChange('masonry')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={getButtonVariant('slideshow')}
              size="icon"
              className="h-9 w-9 rounded-none rounded-r-md"
              onClick={() => handleLayoutChange('slideshow')}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Results count and active filters */}
      {(searchQuery || selectedTags.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="text-xs">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'result' : 'results'}
          </Badge>
          
          {selectedTags.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              {tag}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => toggleTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {(searchQuery || selectedTags.length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs" 
              onClick={() => {
                clearSearch();
                clearTags();
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
      
      {/* Gallery Content */}
      <div className="relative">
        {/* Grid Layout */}
        {(currentLayout as GalleryLayout) === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo, index) => (
              <Card 
                key={photo.id} 
                className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => handlePhotoClick(index)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={getPhotoPublicUrl(photo)}
                      alt={photo.filename}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      priority={index < 4}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white truncate">{photo.filename}</p>
                      <p className="text-xs text-white/80">{formatFileSize(photo.size || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Masonry Layout */}
        {(currentLayout as GalleryLayout) === 'masonry' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4">
            {filteredPhotos.map((photo, index) => {
              // Determine if the photo should span multiple rows based on aspect ratio
              const rowSpan = photo.width && photo.height 
                ? Math.ceil((photo.height / photo.width) * 2) 
                : 1;
              
              return (
                <Card 
                  key={photo.id} 
                  className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  style={{ gridRow: `span ${rowSpan}` }}
                  onClick={() => handlePhotoClick(index)}
                >
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full">
                      <Image
                        src={getPhotoPublicUrl(photo)}
                        alt={photo.filename}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                        priority={index < 4}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">{photo.filename}</p>
                        <p className="text-xs text-white/80">{formatFileSize(photo.size || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Slideshow Layout */}
        {currentLayout === 'slideshow' && (
          <div className="slideshow-container">
            {/* ... slideshow content ... */}
          </div>
        )}
      </div>
      
      {/* Lightbox */}
      {selectedPhotoIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          currentIndex={selectedPhotoIndex}
          onClose={handleCloseLightbox}
          onNext={handleNextPhoto}
          onPrevious={handlePrevPhoto}
        />
      )}
    </div>
  )
} 