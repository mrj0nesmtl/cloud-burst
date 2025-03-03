"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Photo } from '@/types/events'
import { usePhotosStore } from '@/store/photos-store'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Download, 
  Share2, 
  Info 
} from 'lucide-react'
import { formatFileSize, formatDateTime } from '@/lib/utils'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

interface PhotoLightboxProps {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export function PhotoLightbox({ 
  photos, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrevious 
}: PhotoLightboxProps) {
  const [showInfo, setShowInfo] = useState(false)
  const getPhotoPublicUrl = usePhotosStore(state => state.getPhotoPublicUrl)
  const currentPhoto = photos[currentIndex]
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        onNext()
      } else if (e.key === 'ArrowLeft') {
        onPrevious()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrevious])
  
  // Handle download
  const handleDownload = async () => {
    try {
      const url = getPhotoPublicUrl(currentPhoto.storage_path)
      const response = await fetch(url)
      const blob = await response.blob()
      
      // Create a download link
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = currentPhoto.filename
      
      // Trigger download
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error('Error downloading photo:', error)
    }
  }
  
  // Handle share
  const handleShare = async () => {
    try {
      const url = getPhotoPublicUrl(currentPhoto.storage_path)
      
      if (navigator.share) {
        await navigator.share({
          title: currentPhoto.filename,
          url: url
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard')
      }
    } catch (error) {
      console.error('Error sharing photo:', error)
    }
  }
  
  // Toggle photo info dialog
  const toggleInfo = () => {
    setShowInfo(!showInfo)
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      {/* Previous button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 text-white hover:bg-white/20 z-10"
        onClick={onPrevious}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      
      {/* Next button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 text-white hover:bg-white/20 z-10"
        onClick={onNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
      
      {/* Photo */}
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
        <Image
          src={getPhotoPublicUrl(currentPhoto.storage_path)}
          alt={currentPhoto.filename}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-contain"
          priority
        />
      </div>
      
      {/* Action buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={toggleInfo}
        >
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Info</span>
        </Button>
      </div>
      
      {/* Photo info dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Photo Information</DialogTitle>
            <DialogDescription>
              Details about this photo
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Filename:</span>
              <span className="col-span-2 text-sm">{currentPhoto.filename}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Size:</span>
              <span className="col-span-2 text-sm">{formatFileSize(currentPhoto.size)}</span>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Type:</span>
              <span className="col-span-2 text-sm">{currentPhoto.mime_type}</span>
            </div>
            
            {currentPhoto.width && currentPhoto.height && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Dimensions:</span>
                <span className="col-span-2 text-sm">{currentPhoto.width} × {currentPhoto.height}</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Uploaded:</span>
              <span className="col-span-2 text-sm">{formatDateTime(currentPhoto.created_at)}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfo(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 