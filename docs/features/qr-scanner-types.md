# QR Scanner Type Definitions

> **Version:** 0.1.0  
> **Last Updated:** April 2, 2025

This document provides details on all the TypeScript types and interfaces used in the QR code scanning functionality.

## Camera Types

```typescript
// src/hooks/useCamera.ts

/**
 * Represents a camera device
 */
export type CameraDevice = {
  deviceId: string;
  label: string;
};

/**
 * Represents a camera error
 */
export type CameraError = {
  type: 'permission_denied' | 'not_supported' | 'not_found' | 'constraint' | 'unknown';
  message: string;
};

/**
 * Configuration options for the camera
 */
export type CameraOptions = {
  facingMode?: 'user' | 'environment';
  aspectRatio?: number;
  width?: number;
  height?: number;
};

/**
 * Return type of the useCamera hook
 */
export interface CameraHookResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isLoading: boolean;
  error: CameraError | null;
  permission: PermissionState | null;
  isCameraSupported: boolean;
  devices: CameraDevice[];
  activeDeviceId: string | undefined;
  startCamera: (deviceId?: string) => Promise<MediaStream | null>;
  stopCamera: () => void;
  switchCamera: (deviceId: string) => Promise<MediaStream | null>;
  capturePhoto: () => Promise<string | null>;
  toggleFacingMode: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  getDevices: () => Promise<CameraDevice[]>;
}
```

## QR Scanner Types

```typescript
// src/hooks/useQrScanner.ts

/**
 * Result of a successful QR code scan
 */
export type ScanResult = {
  text: string;
  isValid: boolean;
  isInvitationToken: boolean;
};

/**
 * Configuration options for the QR scanner
 */
export type ScannerOptions = {
  scanInterval?: number; // How often to scan for QR codes in ms
  autoStart?: boolean; // Whether to start scanning automatically
  onDetected?: (result: string) => void; // Callback when a QR code is detected
};

/**
 * Return type of the useQrScanner hook
 */
export interface QrScannerHookResult extends CameraHookResult {
  isScanning: boolean;
  scanCount: number;
  lastResult: ScanResult | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
}
```

## QR Scanner Component Types

```typescript
// src/components/invitation/qr-scanner.tsx

/**
 * Props for the QrScanner component
 */
export interface QrScannerProps {
  onScanSuccess?: (token: string) => void;
  autoRedirect?: boolean;
  className?: string;
}
```

## Scanner Overlay Component Types

```typescript
// src/components/invitation/scanner-overlay.tsx

/**
 * Props for the ScannerOverlay component
 */
export interface ScannerOverlayProps {
  isScanning: boolean;
  isSuccess: boolean;
  showCrosshair?: boolean;
  className?: string;
}
```

## Camera Component Types

```typescript
// src/components/camera/index.tsx

/**
 * Props for the Camera component
 */
export interface CameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive?: boolean;
  className?: string;
}

/**
 * Props for the PermissionPrompt component
 */
export interface PermissionPromptProps {
  onRequestPermission: () => Promise<boolean>;
}
```

## QR Code Utility Types

```typescript
// src/lib/utils/qr-utils.ts

/**
 * Options for QR code generation
 */
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

## API Types

```typescript
// src/app/api/invitation/lookup/route.ts

/**
 * Schema for the invitation lookup request body
 */
const lookupSchema = z.object({
  email: z.string().email({
    message: 'Please provide a valid email address',
  }),
});

/**
 * Type for the invitation lookup request body
 */
type LookupRequest = z.infer<typeof lookupSchema>;

/**
 * Type for the invitation lookup response
 */
interface LookupResponse {
  invitations: {
    id: string;
    token: string;
    eventId: string;
    status: string;
    rsvpStatus: string | null;
    eventName: string;
    eventDate: string;
  }[];
}

/**
 * Type for the invitation lookup error response
 */
interface LookupErrorResponse {
  error: string;
}
```

## Type Relationships

The diagram below illustrates how these types relate to each other:

```
CameraOptions ────► useCamera ────► CameraHookResult
                      │
                      │
                      ▼
ScannerOptions ────► useQrScanner ────► QrScannerHookResult
                          │
                          │
                          ▼
                    QrScannerProps ────► QrScanner component
                          │
                          │
                          ▼
                  ScannerOverlayProps ────► ScannerOverlay component
                          │
                          │
                          ▼
                    PermissionPromptProps ────► PermissionPrompt component
                          │
                          │
                          ▼
                    QRCodeOptions ────► generateInvitationQRCode function
```

## Using the Types

Here's an example of how to use these types in your code:

```typescript
import { useQrScanner } from '@/hooks/useQrScanner';
import type { QrScannerProps } from '@/components/invitation/qr-scanner';

// Create a QR scanner component that accepts QrScannerProps
function CustomQrScanner(props: QrScannerProps) {
  const {
    videoRef,
    isScanning,
    startScanning,
    stopScanning,
    lastResult
  } = useQrScanner({
    scanInterval: 250,
    autoStart: true,
    onDetected: props.onScanSuccess
  });

  // Component implementation...
}
```

This type system ensures type safety and developer experience throughout the QR code scanning functionality. 