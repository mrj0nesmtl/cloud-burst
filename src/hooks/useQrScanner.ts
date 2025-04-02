'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCamera } from './useCamera';

// We'll need to install the jsQR library
// npm install jsqr
type ScanResult = {
  text: string;
  isValid: boolean;
  isInvitationToken: boolean;
};

type ScannerOptions = {
  scanInterval?: number; // How often to scan for QR codes in ms
  autoStart?: boolean; // Whether to start scanning automatically
  onDetected?: (result: string) => void; // Callback when a QR code is detected
};

/**
 * Hook for QR code scanning using device camera
 */
export function useQrScanner(options: ScannerOptions = {}) {
  const { 
    scanInterval = 300,
    autoStart = false,
    onDetected
  } = options;

  const [isScanning, setIsScanning] = useState(autoStart);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [jsQR, setJsQR] = useState<any>(null);
  
  // Use the camera hook for camera access
  const camera = useCamera({ facingMode: 'environment' });

  // Dynamically import jsQR to avoid server-side rendering issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('jsqr').then(module => {
        setJsQR(() => module.default);
      }).catch(err => {
        console.error('Failed to load jsQR library:', err);
      });
    }
  }, []);

  // Analyze a video frame to look for QR codes
  const analyzeFrame = useCallback(() => {
    if (!jsQR || !camera.videoRef.current || !camera.stream) return null;

    const video = camera.videoRef.current;
    
    // Check if video has valid dimensions before proceeding
    if (!video.videoWidth || !video.videoHeight) {
      // Video dimensions are not available yet
      return null;
    }
    
    // Create a canvas to draw the video frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Ensure canvas dimensions are valid
    if (canvas.width === 0 || canvas.height === 0) {
      console.warn('Canvas has invalid dimensions:', canvas.width, canvas.height);
      return null;
    }
    
    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Get image data for QR code detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Analyze the image data with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      
      return code;
    } catch (err) {
      console.error('Error analyzing frame:', err);
      return null;
    }
  }, [camera.stream, camera.videoRef, jsQR]);

  // Check if a string is a valid invitation token
  const isValidInvitationToken = useCallback((text: string): boolean => {
    // In a real app, add more robust validation
    // Basic validation: check if string has expected format for tokens
    // Assuming tokens are UUIDs or at least long alphanumeric strings
    return /^[a-zA-Z0-9_-]{10,}$/.test(text);
  }, []);
  
  // Extract token from URL if needed
  const extractTokenFromUrl = useCallback((url: string): string | null => {
    try {
      // Handle various URL formats that might be in QR codes
      const urlObj = new URL(url);
      
      // Check if it's an app invitation URL
      if (urlObj.pathname.includes('/invitation/')) {
        // Extract token from URL path (assuming format /invitation/[token])
        const pathParts = urlObj.pathname.split('/');
        const tokenIndex = pathParts.indexOf('invitation') + 1;
        if (tokenIndex < pathParts.length) {
          return pathParts[tokenIndex];
        }
      }
      
      // Check for token in query parameters
      const token = urlObj.searchParams.get('token') || urlObj.searchParams.get('invite');
      if (token) {
        return token;
      }
      
      return null;
    } catch (e) {
      // Not a URL, might be a raw token
      return null;
    }
  }, []);
  
  // Process detected QR code
  const processQrCode = useCallback((code: any) => {
    if (!code || !code.data) return;
    
    const text = code.data;
    let token = text;
    let isInvitationToken = isValidInvitationToken(text);
    
    // If it's not immediately recognizable as a token, try to extract it
    if (!isInvitationToken && text.includes('http')) {
      const extractedToken = extractTokenFromUrl(text);
      if (extractedToken) {
        token = extractedToken;
        isInvitationToken = isValidInvitationToken(extractedToken);
      }
    }
    
    const result: ScanResult = {
      text: token,
      isValid: true,
      isInvitationToken
    };
    
    setLastResult(result);
    
    // Call the callback with the result if provided
    if (isInvitationToken && onDetected) {
      onDetected(token);
    }
    
    return result;
  }, [extractTokenFromUrl, isValidInvitationToken, onDetected]);
  
  // Start scanning for QR codes at regular intervals
  const startScanning = useCallback(async () => {
    console.log('startScanning called, camera stream status:', !!camera.stream);
    
    // Don't start scanning if already scanning
    if (isScanning) {
      console.log('Already scanning, ignoring startScanning call');
      return;
    }
    
    // Start the camera if it's not already running
    if (!camera.stream) {
      console.log('No camera stream, attempting to start camera');
      const streamStarted = await camera.startCamera();
      console.log('Camera start result:', streamStarted ? 'Success' : 'Failed');
      
      if (!streamStarted) {
        console.warn('Failed to start camera, cannot scan');
        return;
      }
    }
    
    console.log('Setting isScanning to true');
    setIsScanning(true);
  }, [camera, isScanning]);
  
  // Stop scanning for QR codes
  const stopScanning = useCallback(() => {
    console.log('stopScanning called');
    setIsScanning(false);
  }, []);

  // Scan loop using requestAnimationFrame for better performance
  useEffect(() => {
    if (!isScanning || !jsQR) {
      console.log('Scan loop not starting: isScanning =', isScanning, 'jsQR =', !!jsQR);
      return;
    }
    
    console.log('Starting scan loop');
    let animationFrameId: number | null = null;
    let lastScanTime = 0;
    let isActive = true;
    
    const scanLoop = (timestamp: number) => {
      if (!isActive) return;
      
      // Only scan if video is properly loaded and has dimensions
      const videoElement = camera.videoRef.current;
      const isVideoReady = videoElement && 
                           videoElement.readyState >= 2 && // HAVE_CURRENT_DATA or higher
                           videoElement.videoWidth > 0 && 
                           videoElement.videoHeight > 0;
      
      if (isVideoReady && timestamp - lastScanTime > scanInterval) {
        lastScanTime = timestamp;
        
        try {
          const code = analyzeFrame();
          if (code) {
            console.log('QR code detected:', code.data);
            processQrCode(code);
            setScanCount(count => count + 1);
          }
        } catch (err) {
          console.error('Error in QR scan loop:', err);
        }
      }
      
      if (isActive) {
        animationFrameId = requestAnimationFrame(scanLoop);
      }
    };
    
    animationFrameId = requestAnimationFrame(scanLoop);
    
    return () => {
      console.log('Cleaning up scan loop');
      isActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
  }, [isScanning, jsQR, analyzeFrame, processQrCode, scanInterval, camera.videoRef]);
  
  // Expose additional methods for better control
  const toggleScanning = useCallback(() => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  }, [isScanning, startScanning, stopScanning]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
      camera.stopCamera();
    };
  }, [camera, isScanning, stopScanning]);
  
  return {
    ...camera,
    isScanning,
    scanCount,
    lastResult,
    startScanning,
    stopScanning,
    toggleScanning,
  };
}

export default useQrScanner; 