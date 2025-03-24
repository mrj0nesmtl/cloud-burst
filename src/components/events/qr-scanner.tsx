'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Camera, RefreshCw, Check, X } from 'lucide-react'
import jsQR from 'jsqr'

interface QRScannerProps {
  onSuccess?: (result: string) => void
  redirectToGallery?: boolean
  eventId?: string
}

export function QRScanner({ onSuccess, redirectToGallery = true, eventId }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Start QR scanning
  const startScanning = async () => {
    setIsScanning(true)
    try {
      const constraints = {
        video: { 
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 720 },
          height: { ideal: 720 }
        }
      }
      
      // Stop any existing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Start QR code detection
        startQRDetection()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: 'Camera Access Error',
        description: 'Could not access your camera. Please check permissions.',
        variant: 'destructive'
      })
      setIsScanning(false)
    }
  }

  // Stop QR scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    setIsScanning(false)
  }

  // Toggle between front and back camera
  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera)
    // Restart scanning with new camera
    if (isScanning) {
      stopScanning()
      setTimeout(() => startScanning(), 300)
    }
  }

  // Handle successful QR code scan
  const handleScanSuccess = async (token: string) => {
    setIsProcessing(true)
    setScanResult(token)
    
    try {
      if (token.includes('magic_link') || token.includes('type=magiclink')) {
        // Handle magic link authentication
        await handleMagicLinkAuth(token)
      } else if (token.includes('/invite/')) {
        // Extract the invitation token
        const inviteToken = token.split('/invite/')[1].split('?')[0]
        await handleInvitationAuth(inviteToken)
      } else if (token.includes('/gallery/')) {
        // Direct gallery access
        const galleryEventId = token.split('/gallery/')[1].split('?')[0]
        
        if (redirectToGallery) {
          router.push(`/events/${galleryEventId}/gallery`)
        }
        
        if (onSuccess) {
          onSuccess(token)
        }
      } else {
        // Unknown QR code format
        toast({
          title: 'Invalid QR Code',
          description: 'The scanned QR code is not valid for Cloud Burst.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error processing QR code:', error)
      toast({
        title: 'Processing Error',
        description: 'Could not process the QR code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
      stopScanning()
    }
  }

  // Handle authentication via magic link
  const handleMagicLinkAuth = async (link: string) => {
    try {
      // Extract token from magic link
      const url = new URL(link)
      const token = url.searchParams.get('token')
      
      if (!token) {
        throw new Error('Invalid magic link')
      }
      
      // Authenticate with the token
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink'
      })
      
      if (error) {
        throw error
      }
      
      toast({
        title: 'Authentication Successful',
        description: 'You are now signed in.',
        variant: 'default'
      })
      
      // Redirect to gallery if parameter is present
      const redirectPath = url.searchParams.get('redirectTo')
      if (redirectPath && redirectToGallery) {
        router.push(redirectPath)
      } else if (eventId && redirectToGallery) {
        router.push(`/events/${eventId}/gallery`)
      }
      
      if (onSuccess) {
        onSuccess(link)
      }
    } catch (error) {
      console.error('Magic link authentication error:', error)
      toast({
        title: 'Authentication Failed',
        description: 'Could not authenticate with the QR code. Please try again.',
        variant: 'destructive'
      })
    }
  }

  // Handle authentication via invitation token
  const handleInvitationAuth = async (token: string) => {
    try {
      // Call API to validate invitation and get event ID
      const response = await fetch(`/api/invitations/validate?token=${token}`)
      
      if (!response.ok) {
        throw new Error('Invalid invitation')
      }
      
      const data = await response.json()
      
      toast({
        title: 'Invitation Valid',
        description: 'Welcome to the event!',
        variant: 'default'
      })
      
      // Redirect to gallery
      if (data.eventId && redirectToGallery) {
        router.push(`/events/${data.eventId}/gallery`)
      }
      
      if (onSuccess) {
        onSuccess(token)
      }
    } catch (error) {
      console.error('Invitation validation error:', error)
      toast({
        title: 'Invalid Invitation',
        description: 'This invitation is not valid or has expired.',
        variant: 'destructive'
      })
    }
  }

  // Start QR code detection using jsQR
  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current || !context) {
        return;
      }
      
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(
          videoRef.current, 
          0, 0, 
          canvas.width, 
          canvas.height
        );
        
        // Get image data for QR processing
        const imageData = context.getImageData(
          0, 0, 
          canvas.width, 
          canvas.height
        );
        
        // Process with jsQR
        const qrCode = jsQR(
          imageData.data, 
          imageData.width, 
          imageData.height,
          { inversionAttempts: 'dontInvert' }
        );
        
        // If QR code found
        if (qrCode && qrCode.data) {
          console.log('QR code detected:', qrCode.data);
          
          // Only process if we're not already processing
          if (!isProcessing && isScanning) {
            handleScanSuccess(qrCode.data);
            return; // Stop scanning loop
          }
        }
      }
      
      // Continue scanning if we're still in scanning mode
      if (isScanning) {
        animationRef.current = requestAnimationFrame(scanFrame);
      }
    };
    
    // Start the scanning loop
    animationRef.current = requestAnimationFrame(scanFrame);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden bg-black p-0 w-full max-w-md mx-auto">
      <div className="relative aspect-square">
        {/* Hidden canvas for QR processing */}
        <canvas 
          ref={canvasRef} 
          className="absolute invisible" 
          aria-hidden="true"
        />
        
        {/* Camera feed */}
        {isScanning && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
        )}
        
        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-60 h-60 border-2 border-white rounded-lg opacity-70"></div>
          </div>
        )}
        
        {/* Placeholder content when not scanning */}
        {!isScanning && !scanResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Camera className="w-20 h-20 text-gray-300" />
          </div>
        )}
        
        {/* Success screen */}
        {scanResult && !isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900 bg-opacity-70">
            <Check className="w-20 h-20 text-white mb-4" />
            <p className="text-white text-lg font-semibold">QR Code Scanned</p>
          </div>
        )}
        
        {/* Processing screen */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-70">
            <Spinner size="lg" className="mb-4" />
            <p className="text-white text-lg font-semibold">Processing...</p>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 flex items-center justify-between bg-gray-950">
        {!isScanning ? (
          <Button 
            onClick={startScanning} 
            className="flex-1" 
            disabled={isProcessing}
            size="lg"
          >
            {scanResult ? 'Scan Again' : 'Start Scanning'}
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button 
              onClick={stopScanning} 
              variant="destructive"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <Button 
              onClick={toggleCamera} 
              variant="outline"
              size="icon"
              className="ml-auto"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            
            {/* Dev-only: Simulate scanning */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={() => handleScanSuccess('https://app.cloudburst.io/gallery/test-event-id')}
                variant="secondary"
                className="ml-2"
              >
                Simulate Scan
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
} 