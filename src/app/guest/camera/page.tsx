'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import { Camera, X, Image as ImageIcon, Upload, CheckCircle, AlertCircle, Cog, FlipHorizontal, Zap, ZapOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { invitationTokenService } from '@/lib/tokens/invitation-token'
import { BottomNav } from '@/components/guest/bottom-nav'
import { CapturePreview } from './CapturePreview'
import { GuestNavigation } from '@/components/guest/GuestNavigation'

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
  const const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<{id: string, preview: string, uploading: boolean, progress: number, uploaded: boolean, error: string | null}[]>([])
  const [allUploaded, setAllUploaded] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(true)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
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
  
  if (isCapturing && capturedPhotoUrl) {
    return (
      <CapturePreview
        photoUrl={capturedPhotoUrl}
        onUpload={handleUpload}
        onRetake={handleRetake}
        onCancel={handleCancel}
      />
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 relative">
        {/* Camera permission denied */}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Camera Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Please allow camera access in your browser settings to capture photos.
            </p>
            <Button onClick={() => initializeCamera(isFrontCamera)}>
              Try Again
            </Button>
          </div>
        )}
        
        {/* Loading state */}
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="animate-pulse flex flex-col items-center">
              <Camera className="h-12 w-12 text-white mb-4" />
              <p className="text-white text-sm">Starting camera...</p>
            </div>
          </div>
        )}
        
        {/* Camera preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
          style={{ display: hasCameraPermission === true && !isInitializing ? 'block' : 'none' }}
        />
        
        {/* Camera controls */}
        {hasCameraPermission === true && !isInitializing && (
          <div className="absolute inset-x-0 bottom-20 flex justify-center space-x-6 p-4">
            {/* Flash toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white border-white/20"
              onClick={toggleFlash}
            >
              {isFlashOn ? <ZapOff className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
            </Button>
            
            {/* Capture button */}
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full bg-white text-black border-4 border-black/10"
              onClick={capturePhoto}
            >
              <div className="h-12 w-12 rounded-full border-2 border-black" />
            </Button>
            
            {/* Camera flip */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm text-white border-white/20"
              onClick={switchCamera}
            >
              <FlipHorizontal className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Bottom navigation */}
      <GuestNavigation token={invitationToken || ''} activeItem="camera" />
      
      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
} 