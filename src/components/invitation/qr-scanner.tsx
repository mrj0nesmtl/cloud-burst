'use client';

import { useEffect, useState, useRef } from 'react';
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
  onScanSuccess?: (token: string) => void;
  autoRedirect?: boolean;
  className?: string;
}

export function QrScanner({ 
  onScanSuccess,
  autoRedirect = true, 
  className 
}: QrScannerProps) {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Initialize QR scanner with callback
  const {
    videoRef,
    startScanning,
    stopScanning,
    isScanning,
    error,
    toggleFacingMode,
    lastResult,
    requestPermission,
    permission
  } = useQrScanner({
    scanInterval: 300,
    onDetected: (result) => handleSuccessfulScan(result),
    autoStart: false
  });
  
  // Function to handle successful scan
  const handleSuccessfulScan = (token: string) => {
    if (scanSuccess) return; // Prevent multiple triggers
    
    // Play success sound
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error playing sound:', err);
      });
    }
    
    // Visual feedback
    setScanSuccess(true);
    stopScanning();
    
    // Show toast notification
    toast({
      title: 'QR Code detected!',
      description: 'Invitation found successfully',
      variant: 'default'
    });
    
    // Call callback if provided
    if (onScanSuccess) {
      onScanSuccess(token);
    }
    
    // Redirect to invitation page if enabled
    if (autoRedirect) {
      setTimeout(() => {
        router.push(`/invitation/${token}`);
      }, 1500);
    }
  };
  
  // Request permission and start scanner on mount
  useEffect(() => {
    const initializeScanner = async () => {
      // Attempt to get camera permission
      const hasPermission = await requestPermission();
      setHasPermission(hasPermission);
      
      // Start scanner if permission granted
      if (hasPermission) {
        startScanning();
      }
    };
    
    initializeScanner();
    
    // Cleanup
    return () => {
      stopScanning();
    };
  }, [requestPermission, startScanning, stopScanning]);
  
  // Toggle scanner function
  const toggleScanner = () => {
    if (isScanning) {
      stopScanning();
    } else {
      setScanSuccess(false);
      startScanning();
    }
  };
  
  // Function to restart the scanner
  const restartScanner = () => {
    setScanSuccess(false);
    startScanning();
  };

  // Check if camera is available
  const hasCamera = !!videoRef.current;
  
  return (
    <div className={cn("relative w-full h-80 md:h-96 bg-muted rounded-lg overflow-hidden", className)}>
      {/* Permission not yet determined */}
      {hasPermission === null && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="sr-only">Checking camera permission...</span>
        </div>
      )}
      
      {/* Permission denied */}
      {hasPermission === false && (
        <PermissionPrompt onRequestPermission={requestPermission} />
      )}
      
      {/* Camera error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <QrCode className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Camera Error</h3>
          <p className="text-muted-foreground mb-4">{error.message || "Couldn't access camera"}</p>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
      
      {/* Video preview */}
      <div className={cn(
        "relative w-full h-full",
        (hasPermission !== true || error) && "hidden"
      )}>
        <video 
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Scanner overlay with animations */}
        <ScannerOverlay isScanning={isScanning} isSuccess={scanSuccess} />
        
        {/* Scanner controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
          <Button 
            variant="secondary"
            size="sm"
            onClick={toggleScanner}
            className="flex-1"
          >
            {isScanning ? 'Pause' : scanSuccess ? 'Scan New' : 'Start'} 
          </Button>
          
          {hasCamera && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFacingMode}
              className="flex-none bg-background/60 backdrop-blur-md"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Switch Camera</span>
            </Button>
          )}
        </div>
        
        {/* Status text */}
        <div className="absolute top-4 left-0 right-0 text-center">
          <div className="inline-block bg-background/60 text-foreground px-3 py-1 rounded-full text-sm backdrop-blur-md">
            {scanSuccess ? 'QR Code Found!' : isScanning ? 'Scanning...' : 'Scanner Paused'}
          </div>
        </div>
      </div>
      
      {/* Audio for success feedback */}
      <audio ref={audioRef} src="/audio/success-beep.mp3" preload="auto" />
    </div>
  );
}

export default QrScanner; 