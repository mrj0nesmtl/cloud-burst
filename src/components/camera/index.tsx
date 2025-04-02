"use client";

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCcw, Camera as CameraIcon, Ban } from 'lucide-react';

export function Camera({
  videoRef,
  isActive = true,
  className = ""
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted ${className}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <CameraIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export function FlipCameraButton() {
  return <RefreshCcw className="h-4 w-4" />;
}

export interface PermissionPromptProps {
  onRequestPermission: () => Promise<boolean>;
}

export function PermissionPrompt({ onRequestPermission }: PermissionPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      await onRequestPermission();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-muted/50">
      <Ban className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">Camera Permission Required</h3>
      <p className="text-muted-foreground mt-2 mb-6">
        Please allow access to your camera to scan QR codes.
      </p>
      <Button 
        onClick={handleRequestPermission} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Requesting...
          </>
        ) : (
          'Allow Camera Access'
        )}
      </Button>
    </div>
  );
} 