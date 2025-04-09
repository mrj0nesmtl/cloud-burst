'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  RotateCw, 
  Trash, 
  Upload,
  RefreshCw,
  X,
  Check
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'

interface CameraCaptureProps {
  eventId: string
  onCapture?: () => void
}

export function CameraCapture({ eventId, onCapture }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        // Clear any previous errors
        setError(null)
        
        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        
        // Get new stream with selected facing mode
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
        
        setStream(mediaStream)
        
        // Connect the stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        setError('Could not access your camera. Please check permissions.')
        toast({
          title: 'Camera Error',
          description: 'Could not access your camera. Please check permissions.',
          variant: 'destructive'
        })
      }
    }
    
    setupCamera()
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode, toast, stream])
  
  // Function to take photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    setIsCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setCapturedImage(imageDataUrl)
      }
    } catch (error) {
      console.error('Error capturing photo:', error)
      toast({
        title: 'Capture Error',
        description: 'Failed to capture photo. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsCapturing(false)
    }
  }
  
  // Function to upload captured photo
  const uploadCapturedPhoto = async () => {
    if (!capturedImage) return
    
    setIsUploading(true)
    
    try {
      // Convert data URL to File object
      const res = await fetch(capturedImage)
      const blob = await res.blob()
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to upload photos')
      }
      
      // Generate unique filename
      const fileExt = 'jpg'
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `events/${eventId}/${fileName}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
        
      if (uploadError) throw uploadError
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)
      
      // Create a database record for the uploaded file
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert({
          event_id: eventId,
          url: publicUrl,
          thumbnail_url: publicUrl, // Using same URL for now
          caption: 'Captured from camera',
          tags: ['camera-capture'],
          storage_path: filePath,
          status: 'pending', // Needs approval if moderation is enabled
          uploaded_by: user.id,
          width: canvasRef.current?.width || 0,
          height: canvasRef.current?.height || 0
        })
      
      if (dbError) throw dbError
      
      toast({
        title: 'Upload Successful',
        description: 'Your photo has been added to the gallery.',
      })
      
      // Reset capture state
      setCapturedImage(null)
      
      // Call onCapture callback
      if (onCapture) onCapture()
    } catch (error) {
      console.error('Error uploading captured photo:', error)
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload photo. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  // Switch between front and back camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setCapturedImage(null)
  }
  
  // Reset capture state
  const resetCapture = () => {
    setCapturedImage(null)
  }
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="w-full p-4 bg-destructive/10 border border-destructive rounded-md text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setError(null)
              setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {!error && (
        <>
          {/* Video preview */}
          <div className={`relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden ${capturedImage ? 'hidden' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button 
                size="icon" 
                variant="secondary" 
                onClick={toggleCamera}
                className="rounded-full w-10 h-10"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
              
              <Button 
                size="icon" 
                variant="secondary" 
                onClick={capturePhoto}
                disabled={isCapturing}
                className="rounded-full w-12 h-12"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          {/* Captured image preview */}
          {capturedImage && (
            <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={resetCapture}
                  className="rounded-full w-10 h-10 bg-destructive hover:bg-destructive/90 text-white"
                >
                  <Trash className="h-5 w-5" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="secondary" 
                  onClick={uploadCapturedPhoto}
                  disabled={isUploading}
                  className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-white"
                >
                  {isUploading ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <Check className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Hidden canvas for capturing */}
          <canvas 
            ref={canvasRef} 
            className="hidden"
          />
        </>
      )}
    </div>
  )
} 