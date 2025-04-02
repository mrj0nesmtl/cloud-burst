'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type CameraDevice = {
  deviceId: string;
  label: string;
};

export type CameraError = {
  type: 'permission_denied' | 'not_supported' | 'not_found' | 'constraint' | 'unknown';
  message: string;
};

export type CameraOptions = {
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
  width?: number;
  height?: number;
};

/**
 * Hook for accessing device camera with permission handling
 */
export function useCamera(options: CameraOptions = {}) {
  // Default to environment-facing camera (back camera) for QR scanning
  const defaultOptions = {
    facingMode: 'environment',
    aspectRatio: 1,
    width: 1280,
    height: 720,
    ...options,
  };

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const initializingRef = useRef(false);

  // Check if camera is supported in this browser/device
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    
    const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsCameraSupported(isSupported);
    
    if (!isSupported) {
      setError({
        type: 'not_supported',
        message: 'Camera not supported in this browser or device'
      });
    }
  }, []);

  // Check for camera permission when component mounts
  useEffect(() => {
    async function checkPermission() {
      try {
        if (navigator.permissions) {
          const { state } = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermission(state);
        }
      } catch (err) {
        console.log('Permission API not supported');
      }
    }

    checkPermission();
  }, []);

  // Get list of available camera devices
  const getDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Media Devices API not supported');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 4)}...`
        }));

      setDevices(videoDevices);
      
      // Select the first device if none is selected
      if (videoDevices.length > 0 && !activeDeviceId) {
        // Try to find a back-facing camera first
        const backCamera = videoDevices.find(
          d => d.label.toLowerCase().includes('back') || 
               d.label.toLowerCase().includes('environment')
        );
        
        setActiveDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      console.error('Error getting camera devices:', err);
      setError({
        type: 'not_found',
        message: 'Failed to enumerate camera devices'
      });
      return [];
    }
  }, [activeDeviceId]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    if (!isCameraSupported) return null;
    
    // Prevent multiple simultaneous initialization attempts
    if (initializingRef.current) {
      console.log('Camera initialization already in progress');
      return null;
    }
    
    // Reset retry count if this is a new call (not a retry)
    if (!isInitializing) {
      setRetryCount(0);
    }
    
    // Check if we've exceeded retry limit
    if (retryCount >= MAX_RETRIES) {
      setError({
        type: 'unknown',
        message: 'Failed to initialize camera after multiple attempts'
      });
      setIsInitializing(false);
      initializingRef.current = false;
      return null;
    }
    
    setIsLoading(true);
    setIsInitializing(true);
    initializingRef.current = true;
    setError(null);

    try {
      // If a specific device is requested, use that, otherwise use constraints based on options
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: defaultOptions.facingMode,
              width: { ideal: defaultOptions.width },
              height: { ideal: defaultOptions.height },
              aspectRatio: { ideal: defaultOptions.aspectRatio },
            },
        audio: false,
      };

      // Stop any existing stream first to avoid conflicts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (deviceId) {
        setActiveDeviceId(deviceId);
      }
      
      // If we got a stream but don't have devices list yet, fetch them
      if (devices.length === 0) {
        getDevices();
      }
      
      // Update permission state after successful camera access
      setPermission('granted');

      // Connect stream to video element if ref exists
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready with better error handling
        await new Promise<void>((resolve, reject) => {
          const videoElement = videoRef.current;
          if (!videoElement) {
            resolve();
            return;
          }
          
          // If video is already loaded, resolve immediately
          if (videoElement.readyState >= 2) {
            resolve();
            return;
          }
          
          // Set up event listeners for both success and failure
          const handleLoaded = () => {
            videoElement.removeEventListener('loadeddata', handleLoaded);
            resolve();
          };
          
          const handleError = (e: Event) => {
            videoElement.removeEventListener('error', handleError);
            reject(new Error('Video element encountered an error'));
          };
          
          videoElement.addEventListener('loadeddata', handleLoaded);
          videoElement.addEventListener('error', handleError);
          
          // Try to play the video with a more robust approach
          let playAttempt;
          try {
            playAttempt = videoElement.play();
            
            // Modern browsers return a promise from play()
            if (playAttempt !== undefined) {
              playAttempt
                .then(() => {
                  // Play started successfully
                })
                .catch(e => {
                  // This error is expected in some cases and we'll handle it
                  console.warn('Initial play attempt was rejected:', e.name);
                  
                  // If play was interrupted specifically, we can try again once on user interaction
                  if (e.name === 'AbortError' || e.name === 'NotAllowedError') {
                    // We'll still consider this initialization successful,
                    // but will rely on user interaction to start playing
                    console.log('Play will require user interaction');
                  }
                });
            }
          } catch (e) {
            console.warn('Error in initial play attempt:', e);
            // Continue despite play error - we'll handle this later
          }
          
          // Set a timeout to resolve anyway after a reasonable time
          // This prevents hanging if play() is perpetually pending
          setTimeout(() => {
            resolve();
          }, 2000);
        });
      }

      setIsInitializing(false);
      initializingRef.current = false;
      return mediaStream;
    } catch (err: any) {
      console.error('Error starting camera:', err);

      // Handle different error types
      let errorType: CameraError['type'] = 'unknown';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorType = 'permission_denied';
        setPermission('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorType = 'not_found';
      } else if (err.name === 'ConstraintNotSatisfiedError' || err.name === 'OverconstrainedError') {
        errorType = 'constraint';
      }

      setError({
        type: errorType,
        message: err.message || 'Failed to access camera'
      });
      
      // Increment retry count and potentially retry after a delay
      const currentRetryCount = retryCount + 1;
      setRetryCount(currentRetryCount);
      
      if (currentRetryCount < MAX_RETRIES) {
        console.log(`Retrying camera initialization (attempt ${currentRetryCount + 1} of ${MAX_RETRIES})...`);
        
        // Wait before retrying
        setTimeout(() => {
          startCamera(deviceId);
        }, 1000); // 1 second delay between retries
      } else {
        setIsInitializing(false);
        initializingRef.current = false;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultOptions, devices.length, getDevices, isCameraSupported, isInitializing, retryCount, stream]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Switch to a different camera
  const switchCamera = useCallback(async (deviceId: string) => {
    stopCamera();
    return startCamera(deviceId);
  }, [startCamera, stopCamera]);

  // Capture a photo from the camera stream
  const capturePhoto = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!stream || !videoRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      
      // Create a canvas element to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL (image)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      resolve(dataUrl);
    });
  }, [stream]);

  // Toggle between front and back cameras if available
  const toggleFacingMode = useCallback(async () => {
    if (devices.length <= 1) return;

    const currentDeviceIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
    if (currentDeviceIndex === -1) return;

    const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    await switchCamera(devices[nextDeviceIndex].deviceId);
  }, [activeDeviceId, devices, switchCamera]);

  // Request permission and start camera
  const requestPermission = useCallback(async () => {
    try {
      await startCamera();
      return true;
    } catch (err) {
      return false;
    }
  }, [startCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    videoRef,
    isLoading,
    error,
    permission,
    isCameraSupported,
    devices,
    activeDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    toggleFacingMode,
    requestPermission,
    getDevices,
  };
}

export default useCamera; 