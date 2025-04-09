'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Camera, 
  Image
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaUploader } from '@/components/gallery/media-uploader'
import { CameraCapture } from '@/components/camera/camera-capture'

interface UploadButtonProps {
  eventId: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showUploadIcon?: boolean
}

export function UploadButton({ 
  eventId, 
  variant = 'default', 
  size = 'default',
  showUploadIcon = true
}: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  
  const handleUploadComplete = () => {
    // Close dialog after a delay to show success state
    setTimeout(() => {
      setIsOpen(false)
    }, 1000)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          {showUploadIcon && <Upload className="h-4 w-4" />}
          Add Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Gallery</DialogTitle>
          <DialogDescription>
            Upload photos from your device or take a new photo with your camera.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Upload Media
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Take Photo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="py-4">
            <MediaUploader
              eventId={eventId}
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>
          
          <TabsContent value="camera" className="py-4">
            <CameraCapture
              eventId={eventId}
              onCapture={handleUploadComplete}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 