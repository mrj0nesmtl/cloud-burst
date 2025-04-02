import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScannerOverlayProps {
  isScanning: boolean;
  isSuccess: boolean;
  showCrosshair?: boolean;
  className?: string;
}

export function ScannerOverlay({
  isScanning,
  isSuccess,
  showCrosshair = true,
  className
}: ScannerOverlayProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Only show animations after component is mounted to prevent
  // server/client hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none z-10 flex items-center justify-center",
        className
      )}
    >
      {/* Success overlay */}
      {isSuccess && isMounted && (
        <div className="absolute inset-0 bg-green-500/30 flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-white p-3 rounded-full animate-bounce-gentle">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <p className="mt-4 text-white font-medium text-lg bg-black/40 px-4 py-2 rounded-lg">
            QR Code Detected!
          </p>
        </div>
      )}

      {/* Scanning overlay */}
      {isScanning && !isSuccess && isMounted && (
        <>
          {/* Corners */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-transparent pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
          </div>

          {/* Scanning line animation */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 overflow-hidden pointer-events-none">
            <div className="w-full h-0.5 bg-blue-500 absolute top-0 animate-scanner-line"></div>
          </div>

          {/* Crosshair (optional) */}
          {showCrosshair && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 rounded-full border border-blue-400/50"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-blue-400/30"></div>
              <div className="absolute top-0 left-1/2 h-full w-px bg-blue-400/30"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 