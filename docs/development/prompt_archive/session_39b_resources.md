# Session 39B Testing Resources

## Key File Paths

### Guest Reservation System

```
# Frontend Components
src/components/gallery/guest-reservation-form.tsx   # Guest registration form
src/app/events/[eventId]/register/page.tsx          # Guest registration page

# API Routes
src/app/api/guests/register/route.ts                # Guest registration API
src/app/api/gallery/access/route.ts                 # Gallery access verification

# Database
supabase/migrations/20250409000001_add_guests_gallery_permissions.sql  # Guest tables schema
```

### Gallery System

```
# Frontend Components
src/components/gallery/gallery-grid.tsx             # Main gallery grid component
src/components/gallery/media-card.tsx               # Individual media card
src/components/gallery/gallery-controls.tsx         # Gallery navigation/filtering

# Pages
src/app/gallery/[eventId]/page.tsx                  # Public gallery view
src/app/gallery/[eventId]/guest/[token]/page.tsx    # Guest access gallery view

# API Routes
src/app/api/gallery/[eventId]/route.ts              # Gallery data API
src/app/api/gallery/media/route.ts                  # Media items API
```

### Camera Integration

```
# Frontend Components
src/components/camera/camera-capture.tsx            # Camera capture component
src/components/camera/media-preview.tsx             # Captured media preview
src/components/upload/upload-controls.tsx           # Upload control buttons

# Utilities
src/lib/camera.ts                                   # Camera access helpers
src/lib/media-processing.ts                         # Media processing utilities

# API Routes
src/app/api/upload/route.ts                         # Media upload endpoint
```

## Database Schema Overview

### Guests Table

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  access_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, event_id)
);
```

### Gallery Permissions Table

```sql
CREATE TABLE gallery_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'viewer' CHECK (permission_level IN ('viewer', 'contributor', 'moderator')),
  can_upload BOOLEAN NOT NULL DEFAULT false,
  can_download BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_or_guest_check CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
  )
);
```

## API Endpoints for Testing

### Guest Registration

```
POST /api/guests/register
Body: {
  name: string;
  email: string;
  phone?: string;
  eventId: string;
}
Response: {
  success: boolean;
  message: string;
  guestId?: string;
  token?: string;
}
```

### Gallery Access

```
GET /api/gallery/access?token=<access_token>&eventId=<event_id>
Response: {
  success: boolean;
  allowed: boolean;
  galleryData?: {
    id: string;
    name: string;
    description: string;
    mediaCount: number;
    // ...other fields
  }
}
```

### Media Upload

```
POST /api/upload
Body: FormData with files
Response: {
  success: boolean;
  files: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
    size: number;
    type: string;
  }>
}
```

## Test Accounts

| Type | Email | Purpose |
|------|-------|---------|
| Admin | admin@cloudburst.test | Full system access |
| Event Owner | owner@cloudburst.test | Event creation and management |
| Guest | guest@example.com | Test guest registration |

## Test Events

| Event ID | Name | Public Gallery | Description |
|----------|------|---------------|-------------|
| e7c9a8b6-5d4c-3f2e-1a0b-9c8d7e6f5a4b | Wedding Demo | No | Private gallery requiring guest registration |
| f8d9b7e6-4c5d-2e3f-0a1b-8c7d6e5f4a3b | Conference 2025 | Yes | Public gallery with open access |

## Testing Tools

- Browser DevTools - Network monitoring and console debugging
- Lighthouse - Performance and accessibility testing
- Mobile Device Preview - Chrome DevTools device mode
- Camera Testing - Use both built-in webcam and mobile devices

## Documentation References

- [Guest System Architecture](../architecture/guest_system.md)
- [Gallery Permission System](../architecture/gallery_permissions.md)
- [Camera Integration Guide](../development/camera_integration.md)
- [Mobile Testing Guide](../development/mobile_testing.md)

## Performance Benchmarks

| Feature | Target Load Time | Target Size | Notes |
|---------|-----------------|-------------|-------|
| Gallery Initial Load | < 2s | < 500KB | First contentful paint |
| Image Thumbnails | < 150ms each | < 30KB | Lazy loading |
| Full Image Display | < 1s | < 200KB | Progressive loading |
| Camera Activation | < 500ms | N/A | Time to first frame |

## Known Limitations

1. Camera access requires HTTPS
2. Safari on iOS has limited support for some camera features
3. Gallery performance degrades with more than 200 images
4. Upload size limited to 10MB per file

## Support Contacts

- Backend Support: backend-team@cloudburst.internal
- Frontend Support: frontend-team@cloudburst.internal
- DevOps Support: devops-team@cloudburst.internal 