'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Camera, AlertTriangle } from 'lucide-react';
import { QrScanner } from '@/components/invitation/qr-scanner';

export default function ScanPage() {
  const [scannerActivated, setScannerActivated] = useState(false);
  const [secureContext, setSecureContext] = useState(true);
  
  // Check if we're in a secure context (needed for camera)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSecureContext(window.isSecureContext);
    }
  }, []);
  
  const activateCamera = () => {
    console.log('User clicked "Activate Camera" button');
    setScannerActivated(true);
  };
  
  return (
    <div className="container px-4 py-6 md:py-10 max-w-4xl mx-auto">
      <header className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Scan Invitation QR Code</h1>
          <p className="text-muted-foreground">Point your camera at an invitation QR code</p>
        </div>
      </header>
      
      <main className="space-y-6">
        {!secureContext && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="text-amber-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Secure Connection Required</h3>
                  <p className="text-sm mt-1">
                    Camera access requires a secure connection (HTTPS). 
                    The scanner may not work on insecure connections except on localhost.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
        
        {!scannerActivated ? (
          <Card className="text-center">
            <CardHeader>
              <h2 className="text-xl font-semibold">Camera Access Required</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mx-auto bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <p>This app needs your permission to access the camera for scanning QR codes.</p>
              <p>When prompted, please select "Allow" to grant camera access.</p>
              <div className="flex justify-center mt-4">
                <Button size="lg" onClick={activateCamera}>
                  Activate Camera
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Suspense fallback={
            <div className="h-96 rounded-xl bg-muted flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
            </div>
          }>
            <QrScanner />
          </Suspense>
        )}
        
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">How to scan:</h2>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Allow camera access when prompted</li>
              <li>Press the Start button to begin scanning</li>
              <li>Point your camera at the QR code on the invitation</li>
              <li>Hold steady until the code is recognized</li>
              <li>You'll be redirected to the invitation automatically</li>
            </ol>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Don't have a QR code? You can also enter your invitation code manually.
            </p>
            <Button variant="link" asChild>
              <Link href="/invitation">Enter Invitation Code</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
} 