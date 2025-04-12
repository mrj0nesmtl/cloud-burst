'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Camera, Upload, User, ArrowLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { GuestUploadDropzone } from '@/components/gallery/guest-upload-dropzone'
import { GuestProfileForm } from '@/components/guest/GuestProfileForm'
import { Separator } from '@/components/ui/separator'

interface GuestDashboardProps {
  eventId: string
  invitationToken: string
  eventName: string
}

export function GuestDashboard({ eventId, invitationToken, eventName }: GuestDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Guest Dashboard</CardTitle>
        </CardHeader>
        
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload Photos</TabsTrigger>
            <TabsTrigger value="profile">Your Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center justify-center"
                onClick={() => setCameraDialogOpen(true)}
              >
                <Camera className="h-8 w-8 mb-3" />
                <span>Test Camera</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center justify-center"
                onClick={() => setActiveTab('upload')}
              >
                <Upload className="h-8 w-8 mb-3" />
                <span>Upload Photos</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-8 flex flex-col items-center justify-center col-span-2"
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-8 w-8 mb-3" />
                <span>Complete Your Profile</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="p-4">
            <h3 className="text-lg font-semibold mb-4">Upload Photos</h3>
            <GuestUploadDropzone 
              eventId={eventId}
              invitationToken={invitationToken}
              onUploadComplete={() => {
                // Optionally handle completion, like showing a success message
              }}
            />
          </TabsContent>
          
          <TabsContent value="profile" className="p-4">
            <h3 className="text-lg font-semibold mb-4">Complete Your Profile</h3>
            <GuestProfileForm 
              invitationToken={invitationToken} 
              eventId={eventId}
              onComplete={() => {
                setActiveTab('dashboard')
              }}
            />
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" asChild>
            <Link href={`/invitation/${invitationToken}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Invitation
            </Link>
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Event
          </Button>
        </CardFooter>
      </Card>
      
      {/* Camera Test Dialog */}
      <Dialog open={cameraDialogOpen} onOpenChange={setCameraDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Camera Test</DialogTitle>
            <DialogDescription>
              Test your camera before taking photos at the event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video bg-black rounded-md overflow-hidden relative">
            <CameraTest />
          </div>
          
          <div className="flex justify-end">
            <Button variant="default" onClick={() => setCameraDialogOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Camera component
function CameraTest() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  
  useState(() => {
    // Initialize camera on component mount
    startCamera()
    
    // Clean up camera on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      })
      setStream(mediaStream)
      setError(null)
      setPermissionDenied(false)
      
      // Connect the stream to video element
      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionDenied(true)
        setError('Camera access denied. Please allow camera permissions.')
      } else {
        setError('Could not access camera. Please make sure your device has a camera that is not being used by another application.')
      }
    }
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="text-destructive mb-4">
          {error}
        </div>
        {permissionDenied ? (
          <p className="text-sm text-muted-foreground">
            Please check your browser settings to enable camera access.
          </p>
        ) : (
          <Button variant="outline" onClick={startCamera}>
            Try Again
          </Button>
        )}
      </div>
    )
  }
  
  return (
    <video
      id="camera-preview"
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  )
}

export default GuestDashboard 