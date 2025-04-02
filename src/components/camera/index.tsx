"use client";

import React, { forwardRef } from "react";
import { useCamera } from "@/hooks/useCamera";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera as CameraIcon, RefreshCw, Loader2 } from "lucide-react";

/**
 * Props for the Camera component
 */
export interface CameraProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  onCapture?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  facingMode?: "user" | "environment";
  isActive?: boolean;
  className?: string;
  width?: number;
  height?: number;
  controls?: boolean;
}

/**
 * Camera component for capturing photos and video streams
 */
export const Camera = forwardRef<HTMLVideoElement, CameraProps>(
  (
    {
      videoRef: externalVideoRef,
      onCapture,
      onError,
      facingMode = "environment",
      isActive = true,
      className,
      width = 640,
      height = 480,
      controls = true,
    },
    ref
  ) => {
    const {
      videoRef: internalVideoRef,
      isLoading,
      error,
      permission,
      isCameraSupported,
      devices,
      startCamera,
      stopCamera,
      toggleFacingMode,
      capturePhoto,
      requestPermission,
    } = useCamera({
      facingMode,
      width,
      height,
    });

    // Use externally provided ref if available, otherwise use internal ref
    const videoRefToUse = externalVideoRef || internalVideoRef;

    // Handle errors
    React.useEffect(() => {
      if (error && onError) {
        onError(error.message);
      }
    }, [error, onError]);

    // Start camera when component mounts if isActive
    React.useEffect(() => {
      if (isActive) {
        startCamera();
      }

      // Cleanup on unmount
      return () => {
        stopCamera();
      };
    }, [isActive, startCamera, stopCamera]);

    // Handle camera capture
    const handleCapture = async () => {
      const image = await capturePhoto();
      if (image && onCapture) {
        onCapture(image);
      }
    };

    // Check if camera is supported
    if (!isCameraSupported) {
      return (
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted text-muted-foreground">
          <CameraIcon className="h-12 w-12 mb-2 opacity-50" />
          <p>Camera not supported on this device</p>
        </div>
      );
    }

    // Display permission request if needed
    if (permission === "prompt" || permission === "denied") {
      return <PermissionPrompt onRequestPermission={requestPermission} />;
    }

    return (
      <div className={cn("relative w-full", className)}>
        <video
          ref={(node) => {
            // Handle both forwarded ref and internal ref
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            
            // Always update the internal/external video ref
            if (videoRefToUse && node) {
              if (typeof videoRefToUse === 'object' && videoRefToUse.current !== node) {
                // Safe assignment that won't trigger the read-only warning
                Object.defineProperty(videoRefToUse, 'current', {
                  writable: true,
                  value: node
                });
              }
            }
          }}
          className={cn(
            "w-full h-full object-cover rounded-lg",
            isLoading && "opacity-50"
          )}
          autoPlay
          playsInline
          muted
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {controls && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            {onCapture && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCapture}
                disabled={isLoading || !!error}
                className="rounded-full h-12 w-12 bg-background/80 backdrop-blur-sm"
              >
                <CameraIcon className="h-6 w-6" />
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleFacingMode}
              disabled={isLoading || !!error || devices.length < 2}
              className="rounded-full h-12 w-12 bg-background/80 backdrop-blur-sm"
            >
              <RefreshCw className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

Camera.displayName = "Camera";

/**
 * Props for the PermissionPrompt component
 */
interface PermissionPromptProps {
  onRequestPermission: () => Promise<boolean>;
}

/**
 * Component to request camera permission
 */
export function PermissionPrompt({ onRequestPermission }: PermissionPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 rounded-lg bg-muted">
      <CameraIcon className="h-12 w-12 mb-2 opacity-70" />
      <h3 className="text-lg font-semibold">Camera Access Required</h3>
      <p className="text-center text-sm text-muted-foreground">
        Please allow access to your camera to use this feature. Your privacy is important to us
        and camera access is only used within this application.
      </p>
      <Button onClick={onRequestPermission}>
        <CameraIcon className="mr-2 h-4 w-4" />
        Enable Camera
      </Button>
    </div>
  );
} 