'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import { Camera, X, Image as ImageIcon, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { invitationTokenService } from '@/lib/tokens/invitation-token'
import { BottomNav } from '@/components/guest/bottom-nav'

export default function GuestCameraPage() {
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('token')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<{id: string, preview: string, uploading: boolean, progress: number, uploaded: boolean, error: string | null}[]>([])
  const [allUploaded, setAllUploaded] = useState(false)
  
  // Initialize with token from URL or localStorage
  useEffect(() => {
    const token = urlToken || invitationTokenService.getToken()
    setInvitationToken(token)
    
    if (urlToken) {
      invitationTokenService.storeToken(urlToken)
    }
    
    if (!token) {
      setError('Invitation token not found')
      setLoading(false)
    } else {
      fetchEventDetails(token)
    }
  }, [urlToken])
  
  // Fetch event details using the invitation token
  const fetchEventDetails = async (token: string) => {
    try {
      setLoading(true)
      
      // Get the invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, event_id')
        .eq('token', token)
        .single()
        
      if (invitationError || !invitation) {
        console.error('Error fetching invitation:', invitationError)
        setError('Invalid invitation token')
        setLoading(false)
        return
      }
      
      setInvitationId(invitation.id)
      setEventId(invitation.event_id)
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading event details:', err)
      setError(err.message || 'Failed to load event details')
      setLoading(false)
    }
  }
  
  // Camera functions
  const startCamera = async () => {
    if (videoRef.current) {
      setPermissionError(null)
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        videoRef.current.srcObject = stream
        setCameraActive(true)
      } catch (error) {
        console.error('Error accessing camera:', error)
        
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            setPermissionError('Camera access was denied. Please allow camera access in your browser settings.')
          } else if (error.name === 'NotFoundError') {
            setPermissionError('No camera detected. Please connect a camera and try again.')
          } else {
            setPermissionError(`Camera error: ${error.message}`)
          }
        } else {
          setPermissionError('An unknown error occurred while accessing the camera.')
        }
      }
    }
  }
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }
  
  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraActive) {
        stopCamera()
      }
    }
  }, [cameraActive])
  
  // Take photo
  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Match canvas dimensions to video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to blob with high quality
        try {
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
              else throw new Error('Failed to create image blob')
            }, 'image/jpeg', 0.95)
          })
          
          // Generate preview URL
          const photoId = uuidv4()
          const preview = URL.createObjectURL(blob)
          
          // Add to captured photos
          setCapturedPhotos(prev => [
            ...prev, 
            { 
              id: photoId, 
              preview, 
              uploading: false, 
              progress: 0, 
              uploaded: false,
              error: null
            }
          ])
          
          // Provide feedback
          toast({
            title: "Photo Captured!",
            description: "Your photo has been captured. You can take more or upload them to the event.",
          })
        } catch (err) {
          console.error('Error creating photo:', err)
          toast({
            variant: "destructive",
            title: "Capture Failed",
            description: "There was a problem capturing your photo. Please try again.",
          })
        }
      }
    }
  }
  
  // Upload photos
  const uploadPhotos = async () => {
    if (!eventId || !invitationToken || capturedPhotos.length === 0) return
    
    // Find photos that need uploading
    const photosToUpload = capturedPhotos.filter(p => !p.uploaded && !p.uploading && !p.error)
    if (photosToUpload.length === 0) return
    
    // Update all photos to uploading state
    setCapturedPhotos(prev => 
      prev.map(photo => 
        photosToUpload.some(p => p.id === photo.id)
          ? { ...photo, uploading: true }
          : photo
      )
    )
    
    // Process each photo
    for (const photo of photosToUpload) {
      try {
        // Convert preview URL back to blob
        const response = await fetch(photo.preview)
        const blob = await response.blob()
        
        // Update progress
        updatePhotoProgress(photo.id, 20)
        
        // Create a FormData object for the upload
        const formData = new FormData()
        formData.append('file', blob, `${photo.id}.jpg`)
        formData.append('eventId', eventId)
        formData.append('invitationToken', invitationToken)
        formData.append('metadata', JSON.stringify({
          is_camera_capture: true,
          device_info: navigator.userAgent,
          captured_at: new Date().toISOString(),
          photo_id: photo.id
        }))
        
        // Upload using our API endpoint
        const uploadResponse = await fetch('/api/guest/upload', {
          method: 'POST',
          body: formData
        })
        
        // Update progress
        updatePhotoProgress(photo.id, 70)
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error('Upload API error:', errorData)
          throw new Error(errorData.error || 'Failed to upload photo')
        }
        
        const uploadResult = await uploadResponse.json()
        
        // Mark as completed
        setCapturedPhotos(prev => 
          prev.map(p => 
            p.id === photo.id
              ? { ...p, uploading: false, progress: 100, uploaded: true }
              : p
          )
        )
      } catch (err) {
        console.error('Upload error:', err)
        setCapturedPhotos(prev => 
          prev.map(p => 
            p.id === photo.id
              ? { ...p, uploading: false, progress: 0, error: 'Failed to upload' }
              : p
          )
        )
      }
    }
    
    // Check if all are uploaded
    const updatedPhotos = [...capturedPhotos]
    const allSuccess = updatedPhotos.every(p => p.uploaded || p.error)
    const uploadCount = updatedPhotos.filter(p => p.uploaded).length
    
    if (allSuccess && uploadCount > 0) {
      setAllUploaded(true)
      toast({
        title: `${uploadCount} ${uploadCount === 1 ? 'Photo' : 'Photos'} Uploaded!`,
        description: "Your photos have been added to the event gallery.",
      })
    }
  }
  
  const updatePhotoProgress = (id: string, progress: number) => {
    setCapturedPhotos(prev => 
      prev.map(photo => 
        photo.id === id
          ? { ...photo, progress }
          : photo
      )
    )
  }
  
  const removePhoto = (id: string) => {
    setCapturedPhotos(prev => {
      const filtered = prev.filter(photo => photo.id !== id)
      
      // Revoke the data URI to avoid memory leaks
      const photoToRemove = prev.find(photo => photo.id === id)
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview)
      }
      
      return filtered
    })
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container py-10 space-y-8">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push('/guest/dashboard?token=' + invitationToken)}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Event Camera</h1>
      
      {/* Camera Viewer */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-[4/3]">
        {!cameraActive && !permissionError && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-muted">
            <div>
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">
                Start the camera to begin taking photos
              </p>
              <Button onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            </div>
          </div>
        )}
        
        {permissionError && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-muted">
            <div>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-red-500 mb-4">{permissionError}</p>
              <Button variant="outline" onClick={startCamera}>
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Camera Controls */}
      <div className="flex justify-between items-center mb-8">
        {cameraActive ? (
          <>
            <Button variant="outline" onClick={stopCamera}>
              <X className="mr-2 h-4 w-4" /> 
              Stop Camera
            </Button>
            
            <Button 
              size="lg" 
              className="rounded-full w-16 h-16 p-0 bg-primary"
              onClick={takePhoto}
            >
              <Camera className="h-8 w-8" />
            </Button>
            
            <Button variant="outline" onClick={() => router.push(`/guest/gallery?token=${invitationToken}`)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Gallery
            </Button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            {!permissionError && (
              <Button onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Captured Photos */}
      {capturedPhotos.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">
              Captured Photos ({capturedPhotos.length})
            </h2>
            
            <Button 
              onClick={uploadPhotos} 
              disabled={capturedPhotos.every(p => p.uploaded || p.uploading)}
            >
              <Upload className="mr-2 h-4 w-4" />
              {capturedPhotos.some(p => p.uploading) 
                ? 'Uploading...' 
                : allUploaded 
                  ? 'All Uploaded' 
                  : 'Upload All'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {capturedPhotos.map(photo => (
              <Card key={photo.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <img 
                      src={photo.preview} 
                      alt="Captured photo" 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status overlays */}
                    {photo.uploaded && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      </div>
                    )}
                    
                    {photo.error && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                      </div>
                    )}
                    
                    {/* Remove button */}
                    {!photo.uploading && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {photo.uploading && (
                    <div className="p-2">
                      <Progress value={photo.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Use the shared BottomNav component instead of inline navigation */}
      <BottomNav activeTab="camera" invitationToken={invitationToken} />
    </div>
  )
} 