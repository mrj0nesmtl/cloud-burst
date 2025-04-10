# Session 39: Implementation Guide
# April 9, 2025
# V 0.8.8
# Session 39

## 🎯 Guest Reservation, Gallery Setup & Camera Integration

This document provides detailed technical guidance for implementing the guest reservation onboarding, gallery setup, and camera functionality in Session 39. It includes code patterns, example implementations, and technical considerations.

## 1. Guest Reservation Onboarding

### Guest Reservation Form

```typescript
// src/lib/validations/guest-schema.ts
import { z } from 'zod'

export const guestReservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  eventId: z.string().uuid("Invalid event ID"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
})

export type GuestReservationValues = z.infer<typeof guestReservationSchema>
```

```typescript
// src/components/onboarding/guest-reservation-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { guestReservationSchema, type GuestReservationValues } from '@/lib/validations/guest-schema'
import { useMagicLink } from '@/hooks/use-magic-link'

interface GuestReservationFormProps {
  eventId: string
  eventName: string
}

export function GuestReservationForm({ eventId, eventName }: GuestReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { sendMagicLink, isLoading, isSuccess } = useMagicLink({
    redirectTo: `/events/${eventId}/gallery`
  })
  
  const form = useForm<GuestReservationValues>({
    resolver: zodResolver(guestReservationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      eventId,
      agreeToTerms: false
    }
  })
  
  async function onSubmit(values: GuestReservationValues) {
    setIsSubmitting(true)
    
    try {
      // 1. Create guest reservation
      const response = await fetch('/api/guests/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create reservation')
      }
      
      // 2. Send magic link for authentication
      await sendMagicLink(values.email)
      
    } catch (error) {
      console.error('Error creating guest reservation:', error)
      setIsSubmitting(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="bg-card border rounded-lg shadow-sm p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold">Thank You!</h2>
        <p>We've sent a magic link to your email. Please check your inbox to access the event gallery.</p>
        <p className="text-sm text-muted-foreground">If you don't see the email, please check your spam folder.</p>
      </div>
    )
  }
  
  return (
    <div className="bg-card border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Register for {eventName}</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  We'll send you a magic link to access the event.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the terms and conditions
                  </FormLabel>
                  <FormDescription>
                    By checking this box, you agree to our{' '}
                    <a href="/terms" className="underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="underline">
                      Privacy Policy
                    </a>.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? "Processing..." : "Register Now"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

### Guest API Implementation

```typescript
// src/app/api/guests/reserve/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { guestReservationSchema } from '@/lib/validations/guest-schema'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    // Validate form data
    const result = guestReservationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { name, email, phone, eventId } = result.data
    
    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single()
    
    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Check if guest already exists for this event
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', email)
      .eq('event_id', eventId)
      .single()
    
    if (existingGuest) {
      // Guest already registered, but we'll return success anyway
      // to prevent enumeration attacks
      return NextResponse.json({ success: true })
    }
    
    // Create access token for the guest
    const accessToken = uuidv4()
    
    // Insert guest record
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .insert({
        name,
        email,
        phone: phone || null,
        event_id: eventId,
        access_token: accessToken,
        status: 'registered'
      })
      .select('id')
      .single()
    
    if (guestError) {
      console.error('Error creating guest:', guestError)
      return NextResponse.json(
        { error: 'Failed to create guest reservation' },
        { status: 500 }
      )
    }
    
    // Add gallery access permission for this guest
    await supabase
      .from('gallery_permissions')
      .insert({
        guest_id: guest.id,
        event_id: eventId,
        permission_level: 'view',
        can_upload: true,
        expires_at: null // No expiration for now
      })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling guest reservation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 2. Gallery Setup

### Public Gallery View

```typescript
// src/app/events/[eventId]/gallery/page.tsx
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GalleryHeader } from '@/components/gallery/gallery-header'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { GuestAuthCheck } from '@/components/gallery/guest-auth-check'

export default async function EventGalleryPage({ 
  params 
}: { 
  params: { eventId: string } 
}) {
  const { eventId } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Check if event exists and is public
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      id, name, date, cover_image_url, logo_url, description,
      is_gallery_public
    `)
    .eq('id', eventId)
    .single()
  
  if (eventError || !event) {
    notFound()
  }
  
  // Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  // If gallery is not public, we need to check if user is authorized
  if (!event.is_gallery_public && !user) {
    // Show auth check component if not authenticated
    return <GuestAuthCheck eventId={eventId} eventName={event.name} />
  }
  
  // Fetch gallery photos with pagination
  const { data: photos, error: photosError } = await supabase
    .from('gallery_photos')
    .select('id, url, thumbnail_url, width, height, caption, uploaded_by, created_at')
    .eq('event_id', eventId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (photosError) {
    console.error('Error fetching photos:', photosError)
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      <GalleryHeader event={event} />
      
      <GalleryGrid 
        photos={photos || []} 
        isLoading={false}
        emptyMessage="No photos have been uploaded yet."
        layout="masonry"
        defaultSort="newest"
        showUploadButton={!!user}
        eventId={eventId}
      />
    </div>
  )
}
```

### Guest Authentication Check Component

```typescript
// src/components/gallery/guest-auth-check.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useMagicLink } from '@/hooks/use-magic-link'

// Schema for the auth form
const authSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

interface GuestAuthCheckProps {
  eventId: string
  eventName: string
}

export function GuestAuthCheck({ eventId, eventName }: GuestAuthCheckProps) {
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const { sendMagicLink, isLoading, isSuccess } = useMagicLink({
    redirectTo: `/events/${eventId}/gallery`
  })
  
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: ''
    }
  })
  
  async function onSubmit(values: z.infer<typeof authSchema>) {
    setIsCheckingAccess(true)
    
    try {
      // Check if guest has access to this gallery
      const response = await fetch('/api/gallery/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: values.email,
          eventId
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.hasAccess) {
        // Send magic link for authentication
        await sendMagicLink(values.email)
      } else {
        // Show error that they don't have access
        form.setError('email', { 
          type: 'manual',
          message: "You don't have access to this gallery. Please contact the event organizer."
        })
        setIsCheckingAccess(false)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setIsCheckingAccess(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Magic Link Sent</CardTitle>
            <CardDescription>
              Please check your email for a link to access the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              If you don't see the email, please check your spam folder.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Private Gallery</CardTitle>
          <CardDescription>
            This gallery for "{eventName}" is private. Please enter your email to verify access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll send you a magic link if you have access.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCheckingAccess || isLoading}
              >
                {isCheckingAccess || isLoading ? "Checking..." : "Access Gallery"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need access? Contact the event organizer.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### Media Upload Functionality

```typescript
// src/components/gallery/upload-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Camera, Image } from 'lucide-react'
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
}

export function UploadButton({ eventId }: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Add Photos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Gallery</DialogTitle>
          <DialogDescription>
            Upload photos from your device or take a new photo.
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
              onUploadComplete={() => setIsOpen(false)}
            />
          </TabsContent>
          
          <TabsContent value="camera" className="py-4">
            <CameraCapture
              eventId={eventId}
              onCapture={() => setIsOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

## 3. Camera Activation

### Camera Capture Component

```typescript
// src/components/camera/camera-capture.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  FlipCamera, 
  CircleCheck, 
  X, 
  Upload,
  RefreshCw
} from 'lucide-react'
import { useSupabaseUpload } from '@/hooks/use-supabase-upload'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface CameraCaptureProps {
  eventId: string
  onCapture?: () => void
}

export function CameraCapture({ eventId, onCapture }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { uploadFile, isUploading } = useSupabaseUpload()
  const { toast } = useToast()
  
  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        
        // Get new stream with selected facing mode
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        })
        
        setStream(mediaStream)
        
        // Connect the stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
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
  }, [facingMode])
  
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
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
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
    
    try {
      // Convert data URL to File object
      const res = await fetch(capturedImage)
      const blob = await res.blob()
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // Upload to Supabase
      await uploadFile({
        file,
        eventId,
        caption: 'Captured from camera',
        tags: ['camera-capture']
      })
      
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
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive'
      })
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
      {/* Video preview */}
      <div className={cn(
        "relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden",
        capturedImage && "hidden"
      )}>
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
          >
            <FlipCamera className="h-5 w-5" />
          </Button>
          
          <Button 
            size="icon" 
            variant="secondary" 
            onClick={capturePhoto}
            disabled={isCapturing}
          >
            <Camera className="h-5 w-5" />
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
              variant="destructive" 
              onClick={resetCapture}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="secondary" 
              onClick={uploadCapturedPhoto}
              disabled={isUploading}
            >
              {isUploading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
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
    </div>
  )
}
```

### Supabase Upload Hook

```typescript
// src/hooks/use-supabase-upload.ts
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/components/ui/use-toast'

interface UploadParams {
  file: File
  eventId: string
  caption?: string
  tags?: string[]
}

export function useSupabaseUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  
  const uploadFile = async ({ file, eventId, caption, tags }: UploadParams) => {
    try {
      setIsUploading(true)
      setProgress(0)
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.')
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `events/${eventId}/${fileName}`
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setProgress(Math.round((progress.loaded / progress.total) * 100))
          }
        })
        
      if (uploadError) throw uploadError
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)
      
      // Create a thumbnail for images
      let thumbnailUrl = ''
      if (file.type.startsWith('image/')) {
        // We'd implement thumbnail generation here
        // For now, we'll use the same URL
        thumbnailUrl = publicUrl
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Create a database record for the uploaded file
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert({
          event_id: eventId,
          url: publicUrl,
          thumbnail_url: thumbnailUrl,
          caption: caption || '',
          tags: tags || [],
          storage_path: filePath,
          status: 'pending', // Needs approval if moderation is enabled
          uploaded_by: user.id,
          width: 0, // We would get actual dimensions
          height: 0 // We would get actual dimensions
        })
      
      if (dbError) throw dbError
      
      return { success: true, url: publicUrl }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      })
      return { success: false, error }
    } finally {
      setIsUploading(false)
    }
  }
  
  return {
    uploadFile,
    isUploading,
    progress
  }
}
```

## 4. Database Schema Modifications

For implementing these features, ensure the following tables are properly configured:

```sql
-- Guests table for non-RSVP event attendees
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  access_token UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(email, event_id)
);

-- Gallery permissions table
CREATE TABLE IF NOT EXISTS gallery_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view',
  can_upload BOOLEAN NOT NULL DEFAULT false,
  can_download BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
  )
);

-- Gallery photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add gallery settings to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_gallery_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS requires_photo_approval BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_guest_uploads BOOLEAN NOT NULL DEFAULT false;
```

## 5. Testing Strategy

### End-to-End Testing with Playwright

```typescript
// tests/e2e/guest-onboarding.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Guest Onboarding Flow', () => {
  test('should allow guest registration', async ({ page }) => {
    // Visit the event page
    await page.goto('/events/public-event-id')
    
    // Click the register button
    await page.click('text=Register as Guest')
    
    // Fill out the form
    await page.fill('[name="name"]', 'Test Guest')
    await page.fill('[name="email"]', 'test.guest@example.com')
    await page.check('[name="agreeToTerms"]')
    
    // Submit the form
    await page.click('button:text("Register Now")')
    
    // Verify success message
    await expect(page.locator('text=Thank You')).toBeVisible()
    await expect(page.locator('text=magic link')).toBeVisible()
  })
  
  test('should validate form inputs', async ({ page }) => {
    // Visit the event page
    await page.goto('/events/public-event-id')
    
    // Click the register button
    await page.click('text=Register as Guest')
    
    // Submit without filling out form
    await page.click('button:text("Register Now")')
    
    // Verify validation errors
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible()
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
    await expect(page.locator('text=You must agree to the terms')).toBeVisible()
  })
})

test.describe('Gallery Functionality', () => {
  test('should show login screen for private galleries', async ({ page }) => {
    // Visit a private gallery
    await page.goto('/events/private-event-id/gallery')
    
    // Verify that access form is shown
    await expect(page.locator('text=Private Gallery')).toBeVisible()
    await expect(page.locator('text=Please enter your email')).toBeVisible()
  })
  
  test('should allow photo uploads for authenticated users', async ({ page }) => {
    // Login as test user
    // ... login steps ...
    
    // Visit the gallery
    await page.goto('/events/public-event-id/gallery')
    
    // Click upload button
    await page.click('button:text("Add Photos")')
    
    // Verify upload dialog is shown
    await expect(page.locator('text=Add to Gallery')).toBeVisible()
  })
})
```

## 6. Performance Considerations

1. **Image Optimization**
   - Implement server-side image processing for uploads
   - Generate multiple sizes of thumbnails
   - Use responsive images with srcSet
   - Apply WebP/AVIF formats with fallbacks

2. **Lazy Loading and Virtualization**
   - Use intersection observer for lazy loading images
   - Implement virtualized lists for large galleries
   - Use placeholder thumbnails during loading

3. **Optimistic UI Updates**
   - Show immediate feedback for uploads
   - Optimistically update UI before server confirmation
   - Provide clear progress indicators

4. **Mobile Optimization**
   - Optimize camera capture for mobile devices
   - Use appropriate touch targets
   - Consider reduced data usage options
   - Implement offline capabilities

5. **Security Considerations**
   - Validate file types on upload
   - Implement content scanning for uploaded images
   - Use signed URLs for private galleries
   - Apply proper access controls 