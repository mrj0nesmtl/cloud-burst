'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { uploadAndCreateMedia } from '@/lib/supabase/media'
import { MediaType } from '@/types/media'
import { useMediaStore } from '@/store/media-store'

interface UploadMediaButtonProps {
  eventId: string
  invitationToken?: string
  className?: string
}

export function UploadMediaButton({ eventId, invitationToken, className }: UploadMediaButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const addUpload = useMediaStore((state) => state.addUpload)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setIsUploading(true)
    setIsOpen(false)

    try {
      // Convert FileList to array for easier handling
      const fileArray = Array.from(files)
      
      // Process each file
      for (const file of fileArray) {
        // Add to upload queue
        const uploadId = addUpload(file)
        
        try {
          // Determine media type
          const mediaType = file.type.startsWith('image/') ? MediaType.PHOTO : MediaType.VIDEO
          
          // Upload with invitation token in metadata
          const media = await uploadAndCreateMedia(
            file,
            eventId,
            'auth.uid()', // This will be replaced by RLS with actual user ID
            mediaType,
            {
              invitation_token: invitationToken,
              original_filename: file.name,
              upload_source: 'invitation'
            }
          )
          
          if (!media) throw new Error('Upload failed')
          
          toast({
            title: 'Upload successful',
            description: 'Your media has been uploaded and will be reviewed shortly.',
          })
          
          // Refresh the gallery
          router.refresh()
          
        } catch (error) {
          console.error('Upload error:', error)
          toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: 'There was an error uploading your media. Please try again.',
          })
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} disabled={isUploading}>
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Add Photos/Videos
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Add photos and videos to the event gallery. Supported formats: JPG, PNG, GIF, MP4.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center">
            <label htmlFor="media-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Click to select files or drag and drop
                </span>
              </div>
              <input
                id="media-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 