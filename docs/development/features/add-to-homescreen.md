# Add to Home Screen Feature Implementation

## Overview
This document outlines the implementation plan for enhancing the CloudBurst mobile experience by allowing guests to add the application to their device's home screen, creating a more app-like experience without requiring a native app installation.

## Problem Statement
Currently, guests need to:
1. Remember and type in the URL or find the email link each time they want to access their event dashboard
2. Navigate through a browser experience that feels less integrated with their device
3. Potentially lose access when their browser session expires

## Solution
Implement a Progressive Web App (PWA) approach that allows guests to:
1. Add the CloudBurst guest experience directly to their home screen
2. Launch the app with a full-screen, app-like experience
3. Potentially access some features offline
4. Receive a friendly prompt guiding them through the installation process

## Technical Implementation

### 1. Web App Manifest

Create a `manifest.json` file that defines how the application appears when installed:

```json
// public/manifest.json
{
  "name": "CloudBurst Event",
  "short_name": "CloudBurst",
  "description": "Your event photos and information",
  "start_url": "/guest/dashboard?source=pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0070f3",
  "icons": [
    {
      "src": "/images/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Create App Icons

Generate app icons in all required sizes:
- 72×72
- 96×96
- 128×128
- 144×144
- 152×152
- 192×192 (used for maskable icon)
- 384×384
- 512×512

Store these in `/public/images/icons/`.

### 3. Add Manifest to Layout

Include the manifest in the application layout:

```tsx
// src/app/layout.tsx
export const metadata = {
  // Existing metadata...
  manifest: '/manifest.json',
}
```

### 4. Configure Next.js for PWA

Install the PWA packages:

```bash
npm install next-pwa
```

Update the Next.js configuration:

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing configuration
}

module.exports = withPWA(nextConfig)
```

### 5. Create Service Worker

Create a basic service worker for caching and offline support:

```js
// public/service-worker.js
const CACHE_NAME = 'cloudburst-cache-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/guest/dashboard',
  '/images/logo.png',
  '/images/default-avatar.png',
  // Add other critical assets
];

// Install the service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 6. HomeScreenPrompt Component

This component was defined in the guest-magic-link.md document. It detects the device type and provides appropriate installation instructions.

### 7. Dynamic Prompt Based on Context

Enhance the HomeScreenPrompt to dynamically change based on where users are in the application:

```tsx
// src/components/guest/HomeScreenPrompt.tsx
// Add these props to the existing component
interface HomeScreenPromptProps {
  context?: 'dashboard' | 'gallery' | 'camera' | 'generic';
  delay?: number; // Time in ms before showing the prompt
}

export function HomeScreenPrompt({ 
  context = 'generic', 
  delay = 5000 
}: HomeScreenPromptProps) {
  // Existing code...
  
  // Add contextual messaging
  const getContextMessage = () => {
    switch (context) {
      case 'dashboard':
        return 'Add this dashboard to your home screen for quick access to your event!';
      case 'gallery':
        return 'Add the gallery to your home screen to easily view and share photos!';
      case 'camera':
        return 'Add to your home screen for quick access to the camera!';
      default:
        return 'Add to your home screen for easier access!';
    }
  };
  
  // Update the prompt timing
  useEffect(() => {
    // Existing code with updated delay parameter
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // In the return section, use the context message
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h3 className="font-semibold">Add to Home Screen</h3>
              <p className="text-sm text-muted-foreground">
                {getContextMessage()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isIOS 
                  ? 'Tap the share icon and then "Add to Home Screen"'
                  : 'Tap the menu and select "Add to Home Screen"'
                }
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8. Add Meta Tags for iOS

Add specific meta tags for better iOS integration:

```tsx
// src/app/guest/layout.tsx
export const metadata = {
  // Other metadata...
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CloudBurst Event',
    // iOS splash screen images
    startupImage: [
      {
        url: '/images/splash/apple-splash-2048-2732.jpg',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/splash/apple-splash-1668-2388.jpg',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/splash/apple-splash-1536-2048.jpg',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/splash/apple-splash-1125-2436.jpg',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/splash/apple-splash-1242-2688.jpg',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/splash/apple-splash-828-1792.jpg',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/splash/apple-splash-1242-2208.jpg',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/splash/apple-splash-750-1334.jpg',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/splash/apple-splash-640-1136.jpg',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
}
```

### 9. Persist Guest Token in Local Storage

To ensure guests don't lose access when returning through the home screen icon:

```tsx
// src/contexts/token-context.tsx
// Add this to your existing token context

// Store token in localStorage when it's validated
useEffect(() => {
  if (token && !tokenError) {
    localStorage.setItem('guest-token', token);
  }
}, [token, tokenError]);

// Retrieve token from localStorage on initial load if not in URL
useEffect(() => {
  if (!token && !isLoading) {
    const storedToken = localStorage.getItem('guest-token');
    if (storedToken) {
      // Validate the stored token
      validateToken(storedToken);
    }
  }
}, []);
```

### 10. Add Visual Guides in the UI

Add a dedicated help section in the guest dashboard explaining how to add to home screen:

```tsx
// src/components/guest/AddToHomeScreenGuide.tsx
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AddToHomeScreenGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add to Home Screen</CardTitle>
        <CardDescription>
          Get quick access to your event dashboard by adding this site to your home screen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ios">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ios">iPhone/iPad</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ios" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Step 1: Tap the Share button</h3>
              <div className="relative h-40 w-full rounded overflow-hidden">
                <Image 
                  src="/images/guides/ios-share-button.png"
                  alt="iOS Share Button"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Step 2: Scroll and tap "Add to Home Screen"</h3>
              <div className="relative h-40 w-full rounded overflow-hidden">
                <Image 
                  src="/images/guides/ios-add-to-home.png"
                  alt="iOS Add to Home Screen"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Step 3: Tap "Add" in the top right</h3>
              <p className="text-sm text-muted-foreground">
                The app will now appear on your home screen!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="android" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Step 1: Tap the Menu (⋮) button</h3>
              <div className="relative h-40 w-full rounded overflow-hidden">
                <Image 
                  src="/images/guides/android-menu.png"
                  alt="Android Menu"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Step 2: Tap "Install app" or "Add to Home screen"</h3>
              <div className="relative h-40 w-full rounded overflow-hidden">
                <Image 
                  src="/images/guides/android-add-to-home.png"
                  alt="Android Add to Home Screen"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Step 3: Tap "Add" or "Install"</h3>
              <p className="text-sm text-muted-foreground">
                The app will now appear on your home screen!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

Add this component to the guest dashboard settings or help section.

## Testing Plan

### Device Testing
- Test on iOS devices:
  - iPhone 12/13/14 series
  - iPhone SE
  - iPad Air/Pro
- Test on Android devices:
  - Pixel phones
  - Samsung Galaxy devices
  - Other Android devices with different browsers

### Testing Checklist
1. **Installation Process**
   - Verify the prompt appears correctly on both iOS and Android
   - Test the installation process follows platform-specific guidelines
   - Verify the icon appears correctly on home screens
   - Test the splash screen appears on iOS devices

2. **App Functionality**
   - Verify the app launches correctly from the home screen
   - Test that the token persists when launched from home screen
   - Verify it opens in standalone mode without browser UI
   - Test orientation changes (portrait/landscape)

3. **Offline Capabilities**
   - Test basic functionality when offline
   - Verify cached assets load correctly
   - Test the offline fallback page

## Implementation Timeline
1. Create the manifest.json file
2. Generate app icons in all required sizes
3. Configure Next.js for PWA
4. Implement the service worker
5. Create the HomeScreenPrompt component
6. Add iOS-specific meta tags
7. Implement token persistence
8. Create visual guides
9. Test on multiple devices
10. Refine based on testing feedback

## Resources
- [Next.js PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest specification](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [iOS Web App documentation](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator)
- [iOS Splash Screen Generator](https://appsco.pe/developer/splash-screens)

## Future Enhancements
1. Implement push notifications for new photos
2. Add offline photo upload queue
3. Enhance background sync capabilities
4. Add app shortcuts for quick actions
5. Implement share target API for quicker photo sharing 