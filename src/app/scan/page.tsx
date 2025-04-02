'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QrScanner } from '@/components/invitation/qr-scanner';
import { Button } from '@/components/ui/button';

export default function ScanPage() {
  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <header className="mb-6">
        <Link href="/" className="inline-block mb-4">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">Scan Invitation QR Code</h1>
        <p className="text-center text-muted-foreground mt-1">
          Point your camera at an invitation QR code
        </p>
      </header>
      
      <main>
        <Suspense fallback={
          <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
          </div>
        }>
          <QrScanner autoRedirect={true} showControls={true} />
        </Suspense>
        
        <div className="mt-8 space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="font-medium mb-2">How to scan:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Allow camera access when prompted</li>
              <li>Point your camera at the QR code on the invitation</li>
              <li>Hold steady until the code is recognized</li>
              <li>You'll be redirected to the invitation automatically</li>
            </ol>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Don't have a QR code? You can also enter your invitation code manually.
          </p>
          
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/invitation">
                Enter Invitation Code
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 