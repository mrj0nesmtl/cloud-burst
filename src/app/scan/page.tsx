'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SimpleScan from '@/components/invitation/SimpleScan';
import { Button } from '@/components/ui/button';

export default function ScanPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/" className="text-muted-foreground hover:text-primary mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Scan Invitation QR Code</h1>
        </div>
        <p className="text-muted-foreground">
          Point your camera at an invitation QR code
        </p>
      </header>

      {/* Main content */}
      <main>
        <Suspense fallback={<div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">Loading camera...</div>}>
          <SimpleScan />
        </Suspense>
        
        {/* Instructions */}
        <div className="mt-8 bg-muted p-6 rounded-lg">
          <h2 className="font-semibold text-lg mb-4">How to scan:</h2>
          <ol className="space-y-3 list-decimal list-inside">
            <li>Allow camera access when prompted</li>
            <li>Press the Start button to begin scanning</li>
            <li>Point your camera at the QR code on the invitation</li>
            <li>Hold steady until the code is recognized</li>
            <li>You'll be redirected to the invitation automatically</li>
          </ol>
          
          <div className="mt-6 text-sm text-muted-foreground">
            Don't have a QR code? You can also enter your invitation code manually.
            <div className="mt-3">
              <Link href="/invitation">
                <Button variant="outline" className="w-full">
                  Enter Invitation Code
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 