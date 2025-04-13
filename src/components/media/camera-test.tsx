'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const startCamera = async () => {
    if (videoRef.current) {
      setLoading(true)
      setPermissionError(null)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
        
        videoRef.current.srcObject = stream
        setCameraActive(true)
      } catch (error) {
        console.error('Error accessing camera:', error)
        
        // Handle different types of errors
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
      } finally {
        setLoading(false)
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

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "relative bg-slate-100 border rounded-lg overflow-hidden aspect-video flex items-center justify-center",
          permissionError ? "border-red-300" : "border-slate-200"
        )}
      >
        {!cameraActive && !permissionError && (
          <div className="text-center p-4">
            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {loading 
                ? "Requesting camera access..." 
                : "Click the button below to start your camera"}
            </p>
          </div>
        )}
        
        {permissionError && (
          <div className="text-center p-4">
            <X className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{permissionError}</p>
          </div>
        )}
        
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover",
            !cameraActive && "hidden"
          )} 
        />
        
        {cameraActive && (
          <div className="absolute bottom-2 right-2 bg-black/30 text-white text-xs px-2 py-1 rounded-md">
            Camera Active
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-3">
        {!cameraActive ? (
          <Button 
            onClick={startCamera} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Requesting Camera
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={stopCamera}
            variant="outline"
          >
            Stop Camera
          </Button>
        )}
        
        {permissionError && (
          <Button 
            onClick={startCamera}
            variant="secondary"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
} 