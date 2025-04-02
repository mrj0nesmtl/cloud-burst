"use client";

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

/**
 * Props for the ScannerOverlay component
 */
export interface ScannerOverlayProps {
  isScanning: boolean;
  isSuccess: boolean;
  showCrosshair?: boolean;
  className?: string;
}

/**
 * Scanner overlay component that shows visual feedback during QR scanning
 */
export function ScannerOverlay({
  isScanning,
  isSuccess,
  showCrosshair = true,
  className,
}: ScannerOverlayProps) {
  const [animateScanner, setAnimateScanner] = useState(false);

  // Start animations when scanning
  useEffect(() => {
    if (isScanning) {
      setAnimateScanner(true);
    } else {
      setAnimateScanner(false);
    }
  }, [isScanning]);

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Scanning animation */}
      {isScanning && !isSuccess && (
        <>
          {/* Scanning indicator line */}
          <div 
            className={cn(
              "absolute left-0 right-0 h-0.5 bg-primary z-10 transition-all duration-2000 ease-in-out",
              animateScanner ? "animate-scanner-line" : ""
            )}
          />

          {/* Corners */}
          {showCrosshair && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-2/3 h-2/3 max-w-[300px] max-h-[300px]">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
              </div>
            </div>
          )}

          {/* Pulse animation */}
          {animateScanner && (
            <div 
              className="absolute inset-0 flex items-center justify-center animate-fade-in"
            >
              <div
                className="w-2/3 h-2/3 max-w-[300px] max-h-[300px] border-2 border-primary animate-pulse-out"
              />
            </div>
          )}
        </>
      )}

      {/* Success animation */}
      {isSuccess && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm z-20 animate-fade-in"
        >
          <div
            className="bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center animate-scale-in"
          >
            <Check className="h-10 w-10" />
          </div>

          {/* Circular pulse */}
          <div
            className="absolute w-20 h-20 rounded-full border-4 border-primary animate-ping"
          />
        </div>
      )}

      {/* Scanning status text */}
      {isScanning && !isSuccess && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center">
          <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-center">
            {isScanning ? "Scanning for QR code..." : "Ready to scan"}
          </div>
        </div>
      )}
    </div>
  );
} 