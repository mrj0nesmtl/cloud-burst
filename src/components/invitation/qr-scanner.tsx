'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQrScanner } from '@/hooks/useQrScanner';
import { Camera, CameraOff, RotateCcw, ZapOff, Scan, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ScannerOverlay } from './scanner-overlay';
import { PermissionPrompt } from '@/components/camera';
import { cn } from '@/lib/utils';
import { Loader2, QrCode } from 'lucide-react';
import { Camera as CameraComponent } from '@/components/camera';

interface QrScannerProps {
  onScanSuccess?: (result: string) => void;
  autoRedirect?: boolean;
  visible?: boolean;
}

export function QrScanner({ 
  onScanSuccess, 
  autoRedirect = true,
  visible = true 
}: QrScannerProps) {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [manualStart, setManualStart] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const maxAttempts = 3;
  
  // Initialize scanner with callback for detected QR codes
  const scanner = useQrScanner({
    scanInterval: 500,
    autoStart: false,
    onDetected: (result) => handleSuccessfulScan(result),
  });
  
  // Handle successful scan results
  const handleSuccessfulScan = (result: string) => {
    // Stop scanning once we've found a valid QR code
    scanner.stopScanning();
    setScanSuccess(true);
    
    // Play success sound
    const audio = new Audio('/audio/success-beep.mp3');
    audio.play().catch(err => console.warn('Could not play success sound:', err));
    
    // Show toast notification
    toast({
      title: "QR Code Scanned",
      description: "Successfully scanned invitation code",
      variant: "success",
    });
    
    // Call provided callback
    if (onScanSuccess) {
      onScanSuccess(result);
    }
    
    // Redirect to invitation page if auto-redirect is enabled
    if (autoRedirect) {
      setTimeout(() => {
        router.push(`/invitation/${result}`);
      }, 1000);
    }
  };
  
  // Request camera permissions and start scanning
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const requestPermissionsAndStartScanner = async () => {
      if (!manualStart || !isMounted) return;
      
      // Don't try more than the maximum number of attempts
      if (initializationAttempts >= maxAttempts) {
        console.log(`Exceeded maximum initialization attempts (${maxAttempts}), stopping`);
        return;
      }
      
      try {
        // Debug message
        console.log(`Camera initialization attempt ${initializationAttempts + 1}/${maxAttempts}`);
        
        // Increment initialization attempts
        setInitializationAttempts(prev => prev + 1);
        
        // Request camera permissions
        const cameraStarted = await scanner.startCamera();
        
        if (!isMounted) return; // Check if component is still mounted
        
        console.log('Camera start result:', cameraStarted ? 'Success' : 'Failed');
        
        if (scanner.permission === 'granted') {
          console.log('Camera permission granted, setting hasPermission to true');
          setHasPermission(true);
          
          if (cameraStarted) {
            // Mark as initialized to prevent further attempts
            setCameraInitialized(true);
            
            // Add a small delay before starting scanning to ensure video is ready
            timeoutId = setTimeout(() => {
              if (isMounted && !scanner.isScanning) {
                console.log('Starting scanner after delay');
                scanner.startScanning();
              }
            }, 1000);
          }
        } else if (scanner.permission === 'denied') {
          console.log('Camera permission denied');
          setHasPermission(false);
        } else {
          console.log('Camera permission state:', scanner.permission);
        }
      } catch (error) {
        console.error('Error starting QR scanner:', error);
        setHasPermission(false);
      }
    };
    
    if (manualStart && !cameraInitialized) {
      console.log('Manual start triggered, requesting permissions');
      requestPermissionsAndStartScanner();
    }
    
    // Clean up function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      console.log('Unmounting QR scanner component, cleaning up');
      scanner.stopScanning();
      scanner.stopCamera();
    };
  }, [scanner, manualStart, initializationAttempts, maxAttempts, cameraInitialized]);
  
  // Toggle scanner on/off
  const toggleScanner = () => {
    console.log('Toggle scanner called, current state:', scanner.isScanning);
    if (scanner.isScanning) {
      scanner.stopScanning();
    } else {
      if (!manualStart) {
        console.log('Setting manual start to true');
        setManualStart(true);
      } else if (cameraInitialized) {
        console.log('Camera already initialized, just starting scanner');
        scanner.startScanning();
      } else {
        console.log('Resetting initialization count and retrying');
        setInitializationAttempts(0);
        setCameraInitialized(false);
        setManualStart(true);
      }
      setScanSuccess(false);
    }
  };
  
  // If scanner is not visible, don't render anything
  if (!visible) return null;
  
  // Helper to get appropriate status text
  const getStatusText = () => {
    if (scanner.error) {
      if (scanner.error.type === 'permission_denied') {
        return 'Camera permission denied. Please allow camera access.';
      }
      return `Camera error: ${scanner.error.message}`;
    }
    
    if (scanner.isLoading) return 'Initializing camera...';
    if (scanSuccess) return 'QR code detected!';
    if (scanner.isScanning) return 'Scanning for QR code...';
    return 'Press Start to begin scanning';
  };
  
  return (
    <div className="relative w-full max-w-md mx-auto h-[400px] overflow-hidden rounded-xl bg-slate-900">
      {/* Video Preview */}
      <div className="relative w-full h-full bg-black">
        <video
          ref={scanner.videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay // Add autoPlay attribute to help with browser policies
          onLoadedMetadata={() => {
            console.log('Video metadata loaded, dimensions:', 
              scanner.videoRef.current?.videoWidth, 
              scanner.videoRef.current?.videoHeight);
            
            // Try to play the video when metadata is loaded
            if (scanner.videoRef.current) {
              scanner.videoRef.current.play().catch(e => {
                console.warn('Error playing video on metadata load:', e);
              });
            }
          }}
        />
        
        {/* Scanner Overlay - shows red when no permission, else scanning animation */}
        <div className={`absolute inset-0 ${hasPermission === false ? 'bg-red-500/20' : ''}`}>
          {/* Show scanning animation if scanning and has permission */}
          {scanner.isScanning && hasPermission && !scanSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-white/80 rounded-lg animate-pulse"></div>
              <div className="w-64 h-64 absolute border-t-4 border-blue-500 rounded-lg animate-spin"></div>
            </div>
          )}
          
          {/* Show success animation if scan was successful */}
          {scanSuccess && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Status Indicator */}
        <div className="absolute top-0 inset-x-0 p-2 bg-black/70 text-white text-center">
          {getStatusText()}
          {initializationAttempts >= maxAttempts && !cameraInitialized && (
            <div className="text-red-400 text-xs mt-1">
              Unable to initialize camera after multiple attempts.
              <button 
                className="ml-2 underline text-blue-400" 
                onClick={() => {
                  setInitializationAttempts(0);
                  setCameraInitialized(false);
                  setManualStart(true);
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-black/70 flex justify-between items-center">
          <Button
            variant={scanner.isScanning ? "destructive" : "default"}
            onClick={toggleScanner}
            disabled={scanner.isLoading}
          >
            {scanner.isScanning ? "Pause" : "Start"}
          </Button>
          
          {scanner.devices.length > 1 && (
            <Button
              variant="outline"
              onClick={scanner.toggleFacingMode}
              disabled={!scanner.isScanning}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Switch Camera
            </Button>
          )}
        </div>
        
        {/* Error with retry option */}
        {scanner.error && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Camera Error</h3>
            <p className="text-white/70 text-center mb-4">{scanner.error.message}</p>
            <Button onClick={() => {
              setInitializationAttempts(0);
              setCameraInitialized(false);
              setManualStart(true);
            }}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QrScanner; 