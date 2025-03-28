# 📚 SESSION 31 RESOURCES

## Cloud Burst
📅 *April 1, 2025*  
📊 *Version: 0.8.3-0.8.4*

This document provides relevant resources, file paths, and documentation references for implementing the Session 31 checklist items, focusing on mobile optimization, guest onboarding, and QR code implementation.

## 📂 Relevant Directory Structures

### 📱 Mobile Dashboard Components
```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx         # Main header to be optimized for mobile
│   │   ├── DashboardLayout.tsx         # Layout wrapper that needs responsive updates
│   │   ├── DashboardNav.tsx            # Navigation to be enhanced for mobile
│   │   ├── MobileNav.tsx               # Mobile-specific navigation (to be created)
│   │   └── StatCard.tsx                # Dashboard stats that need mobile optimization
│   ├── ui/
│   │   ├── sheet.tsx                   # Side panel component useful for mobile nav
│   │   ├── drawer.tsx                  # Bottom drawer for mobile interfaces
│   │   └── navigation-menu.tsx         # Navigation needs mobile adaptations
│   └── layout/
│       ├── PageContainer.tsx           # Main container needing responsive adjustments
│       └── ResponsiveGrid.tsx          # Grid layouts for dashboard (to be created)
├── app/
│   ├── protected/
│   │   ├── dashboard/                  # Main dashboard pages to be optimized
│   │   ├── events/                     # Event management pages needing mobile view
│   │   ├── settings/                   # Settings pages requiring mobile layout
│   │   └── gallery/                    # Gallery pages to optimize for mobile
│   └── styles/
│       └── globals.css                 # Global styles where mobile breakpoints are defined
└── hooks/
    ├── use-breakpoint.ts               # Breakpoint detection hook (to be created)
    └── use-mobile-detection.ts         # Mobile detection utilities (to be created)
```

### 🎟️ Guest Onboarding & RSVP Flow
```
src/
├── app/
│   ├── invitation/                     # Invitation-related pages
│   │   ├── [token]/                    # Token-based invitation pages
│   │   │   ├── page.tsx                # Main invitation landing page
│   │   │   └── rsvp-form.tsx           # RSVP form to be enhanced
│   │   └── layout.tsx                  # Layout for invitation pages
│   ├── api/
│   │   ├── invitations/                # Invitation API endpoints
│   │   │   ├── create/                 # Create invitation endpoints
│   │   │   ├── rsvp/                   # RSVP API endpoints (to be created)
│   │   │   └── track/                  # Tracking endpoints (to be created)
│   │   └── auth/
│   │       └── magic-link/             # Magic link authentication (to be created)
│   └── auth/
│       └── magic-link/                 # Magic link handling pages (to be created)
├── components/
│   ├── invitations/
│   │   ├── create-invitation-form.tsx  # Form for creating invitations
│   │   ├── rsvp-form.tsx               # Form for RSVPs (to be enhanced)
│   │   └── invitation-tracker.tsx      # Tracking component (to be created)
│   └── auth/
│       └── magic-link-form.tsx         # Magic link form (to be created)
├── lib/
│   ├── sendgrid.ts                     # SendGrid integration to be extended
│   ├── supabase/
│   │   ├── client.ts                   # Supabase client
│   │   └── server.ts                   # Server-side Supabase client
│   └── validation/
│       └── rsvp-schema.ts              # Zod schema for RSVP (to be created)
└── store/
    └── rsvp.store.ts                   # Zustand store for RSVP (to be created)
```

### 📷 QR Code & Camera Implementation
```
src/
├── components/
│   ├── qr/
│   │   ├── QrCodeGenerator.tsx         # QR code generator component (to be created)
│   │   ├── QrCodeScanner.tsx           # QR code scanner component (to be created)
│   │   └── QrAuthentication.tsx        # QR authentication flow (to be created)
│   └── camera/
│       ├── CameraAccess.tsx            # Camera access component (to be created)
│       ├── PhotoCapture.tsx            # Photo capture component (to be created)
│       └── VideoRecording.tsx          # Video recording component (to be created)
├── hooks/
│   ├── use-camera.ts                   # Camera access hook (to be created)
│   ├── use-qr-scanner.ts               # QR scanning hook (to be created)
│   └── use-media-capture.ts            # Media capture hook (to be created)
├── lib/
│   ├── qr/
│   │   ├── generator.ts                # QR code generation utilities (to be created)
│   │   ├── scanner.ts                  # QR code scanning utilities (to be created)
│   │   └── validator.ts                # QR code validation utilities (to be created)
│   └── camera/
│       ├── permissions.ts              # Camera permission handling (to be created)
│       └── optimization.ts             # Image/video optimization (to be created)
└── app/
    ├── api/
    │   └── qr/
    │       ├── generate/               # QR code generation API (to be created)
    │       └── validate/               # QR code validation API (to be created)
    └── qr/
        ├── scan/                       # QR scanning page (to be created)
        └── event/[id]/                 # Event-specific QR pages (to be created)
```

### 📊 Analytics & Tracking
```
src/
├── lib/
│   ├── analytics/
│   │   ├── invite-tracker.ts           # Invitation tracking utilities (to be created)
│   │   ├── qr-analytics.ts             # QR code analytics (to be created)
│   │   ├── rsvp-metrics.ts             # RSVP metrics utilities (to be created)
│   │   └── device-detection.ts         # Device type tracking (to be created)
│   └── sendgrid/
│       └── tracking.ts                 # SendGrid tracking integration (to be created)
├── components/
│   └── analytics/
│       ├── InvitationDashboard.tsx     # Invitation analytics dashboard (to be created)
│       ├── RsvpMetrics.tsx             # RSVP metrics component (to be created)
│       └── QrAnalytics.tsx             # QR analytics component (to be created)
└── app/
    ├── api/
    │   └── analytics/                  # Analytics API endpoints (to be created)
    └── protected/
        └── analytics/                  # Analytics dashboard pages (to be created)
```

## 🔗 Related Documentation

### 📱 Mobile Responsiveness
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js with Mobile Devices](https://nextjs.org/docs/pages/building-your-application/optimizing/mobile)
- [ShadCN UI Components](https://ui.shadcn.com)
- [React Responsive](https://github.com/contra/react-responsive)
- [Mobile Testing](https://nextjs.org/docs/app/building-your-application/optimizing/testing)

### 🎟️ Guest Onboarding & RSVP
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Magic Link Authentication](https://supabase.com/docs/guides/auth/auth-magic-link)
- [SendGrid API](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Zod Validation](https://zod.dev/)
- [Zustand State Management](https://github.com/pmndrs/zustand)

### 📷 QR Code & Camera
- [QR Code Library](https://www.npmjs.com/package/qrcode)
- [ZXing TypeScript](https://www.npmjs.com/package/@zxing/library)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Camera API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

### 📊 Analytics
- [SendGrid Event Webhook](https://docs.sendgrid.com/for-developers/tracking-events/event)
- [Recharts](https://recharts.org/en-US/) for visualization
- [Browser Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Supabase RLS for Analytics](https://supabase.com/docs/guides/auth/row-level-security)

## 🧩 Technical Implementation Resources

### 📱 Mobile-First Components
```tsx
// Example responsive container component
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn(
      "w-full px-4 py-6 md:px-6 lg:px-8 space-y-6",
      // Adjust padding for smaller devices
      "sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg mx-auto",
      className
    )}>
      {children}
    </div>
  );
}
```

### 🎟️ RSVP Form Example
```tsx
// Example RSVP form with Zod validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const rsvpSchema = z.object({
  status: z.enum(["attending", "declined", "maybe"]),
  dietaryRestrictions: z.string().optional(),
  plusOne: z.boolean().default(false),
  notes: z.string().optional(),
});

type RsvpFormValues = z.infer<typeof rsvpSchema>;

export function RsvpForm({ invitationToken }: { invitationToken: string }) {
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      status: "attending",
      plusOne: false,
    },
  });

  const onSubmit = async (data: RsvpFormValues) => {
    // Submit RSVP
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Will you attend?</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <RadioGroupItem value="attending" label="Yes, I'll be there" />
                <RadioGroupItem value="declined" label="No, I can't make it" />
                <RadioGroupItem value="maybe" label="Maybe, I'll let you know" />
              </RadioGroup>
            </FormItem>
          )}
        />
        
        {/* Additional form fields */}
        
        <Button type="submit">Submit RSVP</Button>
      </form>
    </Form>
  );
}
```

### 📷 QR Code Scanner Example
```tsx
// Example QR code scanner with camera access
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { jsQR } from "jsqr"; // Requires installation

export function QrCodeScanner({
  onScan,
  onError,
}: {
  onScan: (data: string) => void;
  onError: (error: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  
  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setScanning(true);
      }
    } catch (error) {
      setHasPermission(false);
      onError("Camera permission denied");
    }
  }, [onError]);
  
  useEffect(() => {
    let animationFrame: number;
    
    const scanQrCode = () => {
      if (!scanning || !videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrame = requestAnimationFrame(scanQrCode);
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        onScan(code.data);
        setScanning(false);
      } else {
        animationFrame = requestAnimationFrame(scanQrCode);
      }
    };
    
    if (scanning) {
      animationFrame = requestAnimationFrame(scanQrCode);
    }
    
    return () => {
      cancelAnimationFrame(animationFrame);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [scanning, onScan]);
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {hasPermission === false && (
        <Alert variant="destructive">
          Camera access denied. Please enable camera permissions.
        </Alert>
      )}
      
      <div className="relative aspect-square max-w-md w-full overflow-hidden rounded-md bg-muted">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2/3 h-2/3 border-2 border-primary rounded-lg opacity-70" />
        </div>
      </div>
      
      <Button onClick={startScanner} disabled={scanning}>
        {scanning ? "Scanning..." : "Scan QR Code"}
      </Button>
    </div>
  );
}
```

## 🚀 Next Steps

1. Begin with a thorough audit of mobile responsiveness across the application
2. Create reusable responsive components for dashboard layouts
3. Implement the RSVP form with Zod validation
4. Setup SendGrid tracking integration
5. Create the QR code scanner component
6. Implement camera access permissions handling
7. Build analytics dashboard for invitation and QR code tracking
8. Test on various mobile devices and optimize performance 