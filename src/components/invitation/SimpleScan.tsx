'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import jsQR from 'jsqr';

interface SimpleScanProps {
  onScanSuccess?: (result: string) => void;
  autoRedirect?: boolean;
}

export default function SimpleScan({ onScanSuccess, autoRedirect = true }: SimpleScanProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        console.log('Cleaning up media stream');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle successful QR code scan
  const handleQrSuccess = (text: string) => {
    console.log('QR code detected:', text);
    setScanSuccess(true);
    setIsScanning(false);
    
    // Play success sound
    const audio = new Audio('/audio/success-beep.mp3');
    audio.play().catch(err => console.warn('Could not play success sound:', err));
    
    // Show success toast
    toast({
      title: "QR Code Scanned",
      description: "Successfully scanned invitation code",
      variant: "success",
    });
    
    // Call callback if provided
    if (onScanSuccess) {
      onScanSuccess(text);
    }
    
    // Auto-redirect if enabled
    if (autoRedirect) {
      setTimeout(() => {
        router.push(`/invitation/${text}`);
      }, 1000);
    }
  };

  // Start the camera
  const startCamera = async () => {
    setError(null);
    try {
      // Check if already scanning
      if (isScanning) {
        console.log('Already scanning, aborting startCamera');
        return;
      }
      
      // Check if we already have a stream
      if (stream && videoRef.current && videoRef.current.srcObject) {
        console.log('Using existing stream');
        setIsScanning(true);
        return;
      }
      
      console.log('Requesting camera access');
      
      // Request camera with environment facing mode (back camera) for QR scanning
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('Camera access granted');
      setHasPermission(true);
      setStream(mediaStream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready before starting scan
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playing, starting scan');
                setIsScanning(true);
              })
              .catch(e => {
                console.error('Error playing video:', e);
                setError('Unable to start video. Try clicking the Start button again.');
              });
          }
        };
      }
    } catch (err: any) {
      console.error('Error starting camera:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
        setHasPermission(false);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else {
        setError(`Error accessing camera: ${err.message}`);
      }
    }
  };

  // Stop the camera
  const stopCamera = () => {
    console.log('Stopping camera');
    setIsScanning(false);
    
    // Don't actually stop the stream to avoid reinitializing
    // which can cause issues in some browsers
  };

  // Fully stop the camera (on unmount or when explicitly needed)
  const fullStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  // Toggle the scanner on/off
  const toggleScanner = () => {
    if (isScanning) {
      stopCamera();
    } else {
      setScanSuccess(false);
      startCamera();
    }
  };

  // QR code scanning loop
  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    let animationFrame: number;
    let lastScanTime = 0;
    const scanInterval = 200; // ms between scans
    
    const scanQRCode = (timestamp: number) => {
      if (!isScanning) return;
      
      // Only scan at specified intervals to improve performance
      if (timestamp - lastScanTime > scanInterval) {
        lastScanTime = timestamp;
        
        // Check if video is playing and has dimensions
        if (video.readyState === video.HAVE_ENOUGH_DATA && 
            video.videoWidth > 0 && 
            video.videoHeight > 0) {
          
          // Set canvas size to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw current video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            // Get image data from canvas and scan for QR codes
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
            
            // If a QR code is found
            if (code) {
              handleQrSuccess(code.data);
              return; // Stop scanning after successful detection
            }
          } catch (err) {
            console.error('Error analyzing QR code:', err);
          }
        }
      }
      
      // Continue scanning
      animationFrame = requestAnimationFrame(scanQRCode);
    };
    
    // Start the scanning loop
    animationFrame = requestAnimationFrame(scanQRCode);
    
    // Clean up when component unmounts or scanning stops
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isScanning, onScanSuccess, autoRedirect, router]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[400px] overflow-hidden rounded-xl bg-slate-900">
      {/* Video preview */}
      <div className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {/* Hidden canvas for QR code analysis */}
        <canvas 
          ref={canvasRef} 
          className="hidden" 
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0">
          {/* Scanning animation */}
          {isScanning && !scanSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-white/80 rounded-lg animate-pulse"></div>
              <div className="w-64 h-64 absolute border-t-4 border-blue-500 rounded-lg animate-spin"></div>
            </div>
          )}
          
          {/* Success animation */}
          {scanSuccess && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && !isScanning && (
            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
              <div className="bg-black/80 p-4 rounded-lg max-w-xs text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-white text-sm mb-3">{error}</p>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => {
                    setError(null);
                    fullStopCamera();
                    setTimeout(() => startCamera(), 500);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Status text */}
        <div className="absolute top-0 inset-x-0 p-2 bg-black/70 text-white text-center text-sm">
          {scanSuccess ? 'QR Code Detected!' : 
           isScanning ? 'Scanning for QR code...' : 
           hasPermission === false ? 'Camera permission denied' :
           error ? 'Camera error' :
           'Press Start to begin scanning'}
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-black/70 flex justify-center">
          <Button
            onClick={toggleScanner}
            variant={isScanning ? "destructive" : "default"}
            className="w-32"
          >
            {isScanning ? "Pause" : scanSuccess ? "Scan Again" : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
} 