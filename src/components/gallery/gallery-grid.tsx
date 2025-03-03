"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Photo } from '@/types/events'
import { usePhotosStore } from '@/store/photos-store'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PhotoLightbox } from './photo-lightbox'
import { formatFileSize } from '@/lib/utils'

interface GalleryGridProps {
  photos: Photo[]
  isLoading?: boolean
  emptyMessage?: string
}

export function GalleryGrid({ 
  photos, 
  isLoading = false, 
  emptyMessage = "No photos found" 
}: GalleryGridProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const getPhotoPublicUrl = usePhotosStore(state => state.getPhotoPublicUrl)
  
  // Handle photo click to open lightbox
  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
  }
  
  // Close the lightbox
  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null)
  }
  
  // Navigate to next photo in lightbox
  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null || photos.length === 0) return
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length)
  }
  
  // Navigate to previous photo in lightbox
  const handlePrevPhoto = () => {
    if (selectedPhotoIndex === null || photos.length === 0) return
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length)
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
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => handlePhotoClick(index)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={getPhotoPublicUrl(photo.storage_path)}
                  alt={photo.filename}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  priority={index < 4}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{photo.filename}</p>
                  <p className="text-xs text-white/80">{formatFileSize(photo.size)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Lightbox */}
      {selectedPhotoIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onClose={handleCloseLightbox}
          onNext={handleNextPhoto}
          onPrevious={handlePrevPhoto}
        />
      )}
    </>
  )
} 