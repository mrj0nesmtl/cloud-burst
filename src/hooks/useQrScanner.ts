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
    
    // Create a canvas to draw the video frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for QR code detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Analyze the image data with jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    
    return code;
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
    // Start the camera if it's not already running
    if (!camera.stream) {
      await camera.startCamera();
    }
    
    setIsScanning(true);
  }, [camera]);
  
  // Stop scanning for QR codes
  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  // Scan loop using requestAnimationFrame for better performance
  useEffect(() => {
    if (!isScanning || !jsQR) return;
    
    let animationFrameId: number;
    let lastScanTime = 0;
    
    const scanLoop = (timestamp: number) => {
      if (timestamp - lastScanTime > scanInterval) {
        lastScanTime = timestamp;
        
        const code = analyzeFrame();
        if (code) {
          processQrCode(code);
          setScanCount(count => count + 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(scanLoop);
    };
    
    animationFrameId = requestAnimationFrame(scanLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScanning, jsQR, analyzeFrame, processQrCode, scanInterval]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      camera.stopCamera();
    };
  }, [camera]);
  
  return {
    ...camera,
    isScanning,
    scanCount,
    lastResult,
    startScanning,
    stopScanning,
  };
}

export default useQrScanner; 