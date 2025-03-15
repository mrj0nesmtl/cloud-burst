'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export default function QRScanPage() {
  const [hasCamera, setHasCamera] = useState<boolean>(false)
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [cameraPermission, setCameraPermission] = useState<PermissionState | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check for camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasVideoInputs = devices.some(device => device.kind === 'videoinput')
        setHasCamera(hasVideoInputs)
        
        // Check permission if camera is available
        if (hasVideoInputs && navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
          setCameraPermission(permissionStatus.state)
          
          permissionStatus.onchange = () => {
            setCameraPermission(permissionStatus.state)
          }
        }
      } catch (error) {
        console.error('Error checking camera:', error)
        setHasCamera(false)
      }
    }
    
    checkCamera()
    
    // Cleanup on unmount
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    if (!hasCamera || !videoRef.current || !canvasRef.current) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      videoRef.current.srcObject = stream
      setIsScanning(true)
      
      // Start the scanning process after a short delay to let camera initialize
      setTimeout(() => {
        scanIntervalRef.current = setInterval(scanQRCode, 500)
      }, 1000)
      
      toast({
        title: 'Camera activated',
        description: 'Point your camera at an event QR code',
        duration: 3000
      })
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        variant: 'destructive',
        title: 'Camera access denied',
        description: 'Please allow camera access to scan QR codes',
        duration: 5000
      })
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Here you would typically use a QR code scanning library
    // For demonstration, we'll simulate a successful scan after 3 seconds
    setTimeout(() => {
      if (isScanning) {
        // Simulate QR code detection with a random event ID
        const eventId = Math.floor(Math.random() * 1000).toString()
        handleQRCodeDetected(`event_${eventId}`)
      }
    }, 3000)
  }

  const handleQRCodeDetected = (qrData: string) => {
    // Stop scanning
    stopScanning()
    
    // Check if the QR data is valid for an event
    if (qrData.startsWith('event_')) {
      const eventId = qrData.split('_')[1]
      
      toast({
        title: 'QR Code Detected!',
        description: 'Connecting to event gallery...',
        duration: 3000
      })
      
      // Redirect to the event gallery with camera access
      setTimeout(() => {
        router.push(`/events/${eventId}/gallery?camera=true`)
      }, 1000)
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid QR Code',
        description: 'This QR code is not associated with an event',
        duration: 5000
      })
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold">Scan Event QR Code</h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
      
      <Card className="relative overflow-hidden aspect-square w-full bg-muted">
        {isScanning ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-[3px] border-primary border-opacity-70 rounded-lg pointer-events-none" />
            <div className="absolute top-0 right-0 m-3">
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full bg-background/80 backdrop-blur-sm"
                onClick={stopScanning}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Camera className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Scan Event QR Code</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Point your camera at an event QR code to check in and start capturing media
            </p>
            <Button 
              onClick={startScanning} 
              disabled={!hasCamera}
              className="w-full"
            >
              {hasCamera ? "Start Camera" : "No Camera Available"}
            </Button>
          </div>
        )}
      </Card>
      
      <div className="mt-6 text-center">
        <h3 className="text-base font-medium mb-2">Need Help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Scan the QR code provided on your event invitation or by the event organizer.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/auth/signin">
              Sign In Instead
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/help/qr-scanning">
              Scanning FAQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 