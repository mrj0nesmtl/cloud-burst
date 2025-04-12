'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  X, 
  ArrowLeft, 
  Check,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// Define types for our data structure
interface Event {
  id: string
  name: string
  allow_guest_uploads: boolean
  photo_upload_deadline?: string
  [key: string]: any
}

interface Guest {
  id: string
  name?: string
  email?: string
  invitation_token: string
  events: Event
  [key: string]: any
}

interface UploadProgressEvent {
  loaded: number
  total: number
}

// Define photo metadata structure
interface PhotoMetadata {
  uploaded_by: string
  guest_name?: string
  device_info: string
  upload_date: string
}

// Partial photo record structure matching your database schema
interface PhotoRecord {
  event_id: string
  guest_id: string
  storage_path: string
  filename: string
  content_type: string
  size: number
  is_approved: boolean
  metadata: string // Metadata is stored as a JSON string
}

export default function GuestPhotoUploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  
  const [activeTab, setActiveTab] = useState('upload')
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [streamActive, setStreamActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Load guest and event data
  useEffect(() => {
    async function loadGuestData() {
      if (!invitationToken) {
        setError('No invitation token provided')
        setLoading(false)
        return
      }

      try {
        // Fetch guest info using the invitation token
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*, events(*)')
          .eq('invitation_token', invitationToken as any)
          .single()

        if (guestError) {
          throw new Error('Invalid invitation token')
        }

        if (!guestData) {
          throw new Error('Guest not found')
        }

        // Type assertion to ensure TypeScript recognizes the structure
        const typedGuestData = guestData as unknown as Guest

        if (!typedGuestData.events.allow_guest_uploads) {
          throw new Error('Photo uploads are not enabled for this event')
        }

        setGuest(typedGuestData)
        setEvent(typedGuestData.events)
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load guest data')
        setLoading(false)
      }
    }

    loadGuestData()
  }, [invitationToken])

  // Camera stream management
  useEffect(() => {
    // Handle camera stream
    async function setupCamera() {
      if (activeTab === 'camera' && !streamActive) {
        try {
          if (videoRef.current && navigator.mediaDevices) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
              audio: false
            })
            videoRef.current.srcObject = stream
            setStreamActive(true)
            setCameraError(null)
          }
        } catch (err: any) {
          console.error('Camera access error:', err)
          setCameraError(err.message || 'Failed to access camera')
          setStreamActive(false)
        }
      } else if (activeTab !== 'camera' && streamActive) {
        stopCamera()
      }
    }

    setupCamera()

    return () => {
      if (streamActive) {
        stopCamera()
      }
    }
  }, [activeTab, streamActive])

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setStreamActive(false)
    }
  }

  function capturePhoto() {
    if (videoRef.current && canvasRef.current && streamActive) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw the current video frame to the canvas
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert the canvas to a file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
            setSelectedFiles(prev => [...prev, file])
            
            // Switch to upload tab to show the captured photo
            setActiveTab('upload')
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...newFiles])
      // Reset the input so the same file can be selected again if needed
      e.target.value = ''
    }
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadPhotos() {
    if (!invitationToken || !guest?.id || !event?.id || selectedFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Upload error',
        description: 'Missing required information or no photos selected.',
      })
      return
    }

    setUploading(true)
    const newProgress: Record<string, number> = {}
    let uploadCount = 0
    
    try {
      for (const file of selectedFiles) {
        const fileId = uuidv4()
        const fileExt = file.name.split('.').pop()
        const filePath = `events/${event.id}/guest-uploads/${guest.id}/${fileId}.${fileExt}`
        
        newProgress[fileId] = 0
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
        
        // Use custom options with the upload
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })
          
        if (uploadError) throw uploadError
          
        // Create metadata object
        const metadata: PhotoMetadata = {
          uploaded_by: 'guest',
          guest_name: guest.name || 'Unknown Guest',
          device_info: navigator.userAgent,
          upload_date: new Date().toISOString()
        }
        
        // Create record matching database schema
        const photoRecord: PhotoRecord = {
          event_id: event.id,
          guest_id: guest.id,
          storage_path: filePath,
          filename: file.name,
          content_type: file.type,
          size: file.size,
          is_approved: false,
          metadata: JSON.stringify(metadata) // Convert to JSON string
        }
        
        // Record the upload in the database
        const { error: dbError } = await supabase
          .from('photos')
          .insert(photoRecord as any) // Type assertion as temporary solution
          
        if (dbError) throw dbError
        
        // Update progress to 100% since we can't track it directly
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        uploadCount++
      }
      
      // Upload completed successfully
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${uploadCount} photo${uploadCount !== 1 ? 's' : ''}.`,
      })
      
      // Clear the selected files after successful upload
      setSelectedFiles([])
      setUploadProgress({})
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload photos. Please try again.',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-7xl py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-muted-foreground text-center mt-4">
          Please check your invitation link or contact the event organizer.
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/guest/dashboard?token=${invitationToken}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Upload Photos</h1>
        <p className="text-muted-foreground mt-1">
          Share your memories of {event?.name || 'this event'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Upload</CardTitle>
          <CardDescription>
            Upload photos directly from your device or take new ones with your camera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="camera">
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              {selectedFiles.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="relative border rounded-md p-1 aspect-square group"
                      >
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Selected photo ${index + 1}`}
                          className="object-cover w-full h-full rounded-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-background/80 rounded-full p-1
                            opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100 && (
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <div className="text-sm font-medium">
                              {Math.round(uploadProgress[file.name])}%
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add More
                    </Button>
                    
                    <Button
                      onClick={uploadPhotos}
                      disabled={uploading}
                      className="min-w-[120px]"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center
                    cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <ImageIcon className="h-10 w-10 mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-center mb-1">
                    Click to browse or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, PNG or GIF • Max 10MB each
                  </p>
                </div>
              )}
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden"
                onChange={handleFileSelect}
              />
            </TabsContent>
            
            <TabsContent value="camera">
              {cameraError ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Error</AlertTitle>
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden aspect-[4/3] bg-black flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className={cn(
                        "w-full h-full object-contain",
                        !streamActive && "hidden"
                      )}
                    />
                    {!streamActive && (
                      <div className="text-center p-6">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Accessing camera...</p>
                      </div>
                    )}
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <Button 
                    onClick={capturePhoto} 
                    disabled={!streamActive} 
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-muted-foreground">
          <p>Your photos will be reviewed before being added to the event album.</p>
        </CardFooter>
      </Card>
    </div>
  )
} 