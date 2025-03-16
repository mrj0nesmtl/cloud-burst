"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Info, XCircle, CheckCircle } from 'lucide-react'

import { MediaUpload, MediaCard } from '@/components/gallery'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { getEventMedia } from '@/lib/supabase/media'
import { Button } from '@/components/ui/button'
import { MediaType } from '@/types/media'

interface UploadContentProps {
  eventId: string
  userId: string
}

/**
 * Client-side component for the upload page
 */
export function UploadContent({
  eventId,
  userId
}: UploadContentProps) {
  const router = useRouter()
  const [uploadComplete, setUploadComplete] = useState(false)
  const [recentMedia, setRecentMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Load recent uploads on initial render and when uploads complete
  useEffect(() => {
    const loadRecentMedia = async () => {
      setLoading(true)
      try {
        const media = await getEventMedia(eventId)
        // Sort by most recent
        media.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        // Take only the 4 most recent
        setRecentMedia(media.slice(0, 4))
      } catch (error) {
        console.error('Error loading recent media:', error)
        // Prevent continuous retries on error
        setRecentMedia([])
      } finally {
        setLoading(false)
      }
    }
    
    loadRecentMedia()
  }, [eventId, uploadComplete])
  
  // Handle upload complete
  const handleUploadComplete = () => {
    setUploadComplete(true)
    // Reset after a delay
    setTimeout(() => {
      setUploadComplete(false)
    }, 3000)
  }
  
  // View gallery
  const handleViewGallery = () => {
    router.push(`/events/${eventId}/gallery`)
  }
  
  return (
    <div className="space-y-8">
      {/* Upload component */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 space-y-2">
            <h2 className="text-xl font-semibold">Upload Media</h2>
            <p className="text-muted-foreground">
              Drag and drop files or click to browse. You can upload up to 100 files at once.
            </p>
          </div>
          
          <MediaUpload
            eventId={eventId}
            userId={userId}
            onUploadComplete={handleUploadComplete}
            acceptedMediaTypes={[MediaType.PHOTO, MediaType.VIDEO]}
            maxFileSizeMB={50}
            maxFiles={100}
          />
        </CardContent>
      </Card>
      
      {/* Upload complete message */}
      {uploadComplete && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Upload Complete</AlertTitle>
          <AlertDescription>
            Your media has been uploaded successfully. It will be reviewed by the event organizer before being published.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Recently uploaded media */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Uploads</h2>
          <Button onClick={handleViewGallery}>View All</Button>
        </div>
        
        {recentMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentMedia.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                aspectRatio={media.media_type === 'video' ? 'video' : 'square'}
                showApproval={true}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Recent Uploads</AlertTitle>
            <AlertDescription>
              You haven't uploaded any media to this event yet. Start uploading now!
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Upload guidelines */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Guidelines</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Acceptable file types:</span> JPG, PNG, GIF, WEBP, MP4, WEBM, MOV
            </p>
            <p>
              <span className="font-medium">Maximum file size:</span> 50MB per file
            </p>
            <p>
              <span className="font-medium">Review process:</span> All uploads will be reviewed by the event organizer before being published.
            </p>
            <p>
              <span className="font-medium">Privacy:</span> Only event attendees will be able to view the approved media.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 