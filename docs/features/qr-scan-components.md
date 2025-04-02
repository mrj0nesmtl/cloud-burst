# QR Code Scanner Implementation Guide

> **Version:** 0.1.0  
> **Last Updated:** April 2, 2025

## Overview

The QR code scanning functionality in Cloud Burst provides a seamless way for users to scan invitation QR codes. The implementation consists of several key components:

1. Camera access hooks and utilities
2. QR code scanning hooks
3. Scanner UI components
4. QR code utilities
5. Scanning page and routes

This guide details how these components work together to provide the QR scanning experience.

## Component Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  Scan Page (Route)  │     │ Invitation Lookup   │
│                     │     │                     │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│    QR Scanner       │     │    QR Utilities     │
│    Component        │     │                     │
│                     │     │                     │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          ▼                           │
┌─────────────────────┐               │
│                     │               │
│  Scanner Overlay    │               │
│                     │               │
└─────────┬───────────┘               │
          │                           │
          ▼                           │
┌─────────────────────┐               │
│                     │◄──────────────┘
│   useQrScanner      │
│      Hook           │
│                     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│                     │
│    useCamera        │
│      Hook           │
│                     │
└─────────────────────┘
```

## Key Files

| File | Description |
|------|-------------|
| `src/hooks/useCamera.ts` | Hook for camera device access, permissions, and streams |
| `src/hooks/useQrScanner.ts` | Hook that analyzes video frames to detect QR codes |
| `src/components/invitation/qr-scanner.tsx` | Main QR scanner component with UI and controls |
| `src/components/invitation/scanner-overlay.tsx` | Overlay with animations for scanning feedback |
| `src/components/camera/index.tsx` | Camera UI components and permission prompt |
| `src/lib/utils/qr-utils.ts` | Utilities for generating and validating QR codes |
| `src/app/scan/page.tsx` | Standalone page for scanning QR codes |
| `src/app/api/invitation/lookup/route.ts` | API endpoint for invitation email lookup |

## Core Functionality

### Camera Access

The `useCamera` hook provides core camera device access functionality:

- Device permission handling
- Camera stream initialization
- Device enumeration and switching
- Error handling
- Photo capture

```typescript
const {
  videoRef,
  startCamera,
  stopCamera,
  isCameraSupported,
  devices,
  error,
  permission,
  toggleFacingMode,
  requestPermission
} = useCamera();
```

### QR Scanning

The `useQrScanner` hook builds on top of the camera hook to provide QR code detection:

- Initializes the camera stream
- Analyzes video frames for QR codes
- Detects and validates QR codes
- Provides callbacks for detected codes
- Manages scanning state

```typescript
const {
  videoRef,
  startScanning,
  stopScanning,
  isScanning,
  lastResult,
  error
} = useQrScanner({
  scanInterval: 300,
  onDetected: (result) => handleDetectedCode(result)
});
```

### Scanner UI

The `QrScanner` component provides a complete scanner UI:

- Camera video preview
- Scanning animations and feedback
- Success state visualization
- Camera controls
- Permission handling
- User guidance

### Scanner Overlay

The `ScannerOverlay` component adds:

- Animated scanning line
- Corner markers for targeting guidance
- Pulsing animation during active scanning
- Success animation on valid QR detection

### QR Utilities

The `qr-utils.ts` file provides utilities for:

- Generating QR codes for invitations
- Validating invitation token formats
- Extracting tokens from URLs

## Implementation Details

### Camera Permission Flow

1. Component mounts and checks for camera support
2. If supported, requests camera permission
3. Handles permission states (granted, denied, prompt)
4. Shows appropriate UI based on permission state
5. When granted, initializes camera stream

### QR Code Detection

1. Camera stream is initialized
2. Each frame is analyzed at regular intervals
3. QR codes are extracted using the jsQR library
4. Detected codes are validated as invitation tokens
5. Valid tokens trigger the success callback

### Success Handling

1. QR code is successfully detected
2. Success state is triggered (visual feedback)
3. Success sound is played
4. User is notified via toast message
5. User is redirected to the invitation page (if enabled)

## Usage Examples

### Basic Scanner Implementation

```tsx
import { QrScanner } from '@/components/invitation/qr-scanner';

function ScanPage() {
  const handleScanSuccess = (token: string) => {
    // Handle the detected invitation token
    console.log('Invitation token detected:', token);
    // Redirect to invitation page
    router.push(`/invitation/${token}`);
  };

  return (
    <div className="container">
      <h1>Scan Invitation QR Code</h1>
      <QrScanner 
        onScanSuccess={handleScanSuccess}
        autoRedirect={true}
      />
    </div>
  );
}
```

### Custom QR Code Generation

```tsx
import { generateInvitationQRCode } from '@/lib/utils/qr-utils';

async function InvitationQRCode({ token }: { token: string }) {
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrDataUrl = await generateInvitationQRCode(token, {
          size: 250,
          margin: 2,
          color: {
            dark: '#3B82F6', // Blue
            light: '#FFFFFF'
          }
        });
        setQrCode(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQR();
  }, [token]);

  if (!qrCode) return <div>Loading QR code...</div>;

  return (
    <div className="flex flex-col items-center">
      <img src={qrCode} alt="Invitation QR Code" />
      <p className="mt-2 text-sm text-gray-500">Scan to view invitation</p>
    </div>
  );
}
```

### Using the Camera Component Directly

```tsx
import { Camera } from '@/components/camera';

function PhotoCapturePage() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const handleCapture = (imageUrl: string) => {
    setPhotoUrl(imageUrl);
  };
  
  return (
    <div className="p-4">
      <h1>Take a Photo</h1>
      <Camera 
        onCapture={handleCapture}
        facingMode="user"
        controls={true}
      />
      
      {photoUrl && (
        <div className="mt-4">
          <h2>Captured Photo</h2>
          <img src={photoUrl} alt="Captured" className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
```

## Mobile Considerations

- Performance: The scanner is optimized for mobile devices by using requestAnimationFrame for smooth scanning.
- Battery: Scanning interval is controlled to balance QR detection and battery consumption.
- Permissions: The scanner handles permission requests in a user-friendly way.
- UI: The scanner UI is responsive and provides clear feedback to the user.

## Browser Compatibility

- Modern browsers with camera API support: Chrome, Firefox, Safari, Edge.
- Falls back gracefully with error messages when camera is not supported.
- Uses dynamic imports for jsQR to reduce bundle size and improve performance.

## Security Considerations

- Permission handling uses the browser's native permission API
- QR code validation ensures proper format before redirecting
- API endpoints validate tokens on the server-side
- Camera access is properly cleaned up on component unmount
- Error states are properly handled to prevent security issues

## Future Enhancements

- Offline QR code scanning with background synchronization
- Batch QR code scanning for multiple invitations
- Enhanced error recovery and retry mechanisms
- Improved accessibility for screen readers
- Performance optimizations for low-end devices 