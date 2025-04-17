# Resource Directories Map for Session 42-B
# April 17, 2025
# Focus: Guest Photo Upload QA & Gallery Integration

## Key Focus Areas

- **Photo Upload System**
  - `src/app/guest/camera/page.tsx` - Camera capture page
  - `src/app/guest/upload/page.tsx` - File upload page
  - `src/app/api/guest/upload/route.ts` - Upload API endpoint
  - `src/components/media/camera-capture.tsx` - Camera interface component
  - `src/components/media/file-uploader.tsx` - File upload component
  - `src/hooks/use-camera.ts` - Camera access hook
  - `src/hooks/use-file-upload.ts` - File upload hook
  - `src/lib/utils/media-utils.ts` - Media processing utilities

- **Gallery System**
  - `src/app/guest/gallery/page.tsx` - Gallery view page
  - `src/components/gallery/photo-grid.tsx` - Gallery display component
  - `src/components/gallery/photo-card.tsx` - Individual photo display
  - `src/components/ui/loading-gallery.tsx` - Gallery loading state
  - `src/hooks/use-gallery.ts` - Gallery data fetching hook
  - `src/lib/supabase/photos.ts` - Database operations for photos

- **Token & Authentication**
  - `src/middleware.ts` - Token validation middleware
  - `src/lib/auth/token-service.ts` - Token management service
  - `src/context/token-context.tsx` - Token context provider
  - `src/hooks/use-token.ts` - Token access hook
  - `src/lib/supabase/auth.ts` - Authentication utilities

- **Database & Storage**
  - `supabase/migrations/` - Database migrations
  - `src/lib/supabase/client.ts` - Supabase client configuration
  - `src/lib/supabase/storage.ts` - Storage operations
  - `src/lib/supabase/photos.ts` - Photo database operations
  - `src/lib/supabase/events.ts` - Event database operations
  - `src/types/supabase.ts` - Database type definitions

## Critical Files for QA Testing

1. **Camera Integration**
   - `src/app/guest/camera/page.tsx` - Main camera page
   ```
   /src
     /app
       /guest
         /camera
           page.tsx
   ```
   
   - `src/components/media/camera-capture.tsx` - Camera component
   ```
   /src
     /components
       /media
         camera-capture.tsx
   ```
   
   - `src/hooks/use-camera.ts` - Camera access hook
   ```
   /src
     /hooks
       use-camera.ts
   ```

2. **Upload Processing**
   - `src/app/api/guest/upload/route.ts` - Upload API endpoint
   ```
   /src
     /app
       /api
         /guest
           /upload
             route.ts
   ```
   
   - `src/components/media/file-uploader.tsx` - File upload component
   ```
   /src
     /components
       /media
         file-uploader.tsx
   ```
   
   - `src/lib/utils/media-utils.ts` - Media processing utilities
   ```
   /src
     /lib
       /utils
         media-utils.ts
   ```

3. **Gallery Display**
   - `src/app/guest/gallery/page.tsx` - Gallery page
   ```
   /src
     /app
       /guest
         /gallery
           page.tsx
   ```
   
   - `src/components/gallery/photo-grid.tsx` - Gallery grid component
   ```
   /src
     /components
       /gallery
         photo-grid.tsx
   ```
   
   - `src/hooks/use-gallery.ts` - Gallery data hook
   ```
   /src
     /hooks
       use-gallery.ts
   ```

4. **Database Operations**
   - `src/lib/supabase/photos.ts` - Photo database operations
   ```
   /src
     /lib
       /supabase
         photos.ts
   ```
   
   - `supabase/migrations/20250417_add_guest_media_upload_policy.sql` - RLS policy
   ```
   /supabase
     /migrations
       20250417_add_guest_media_upload_policy.sql
   ```

## Database Schema Relevant for QA

```sql
-- Photos table structure
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  guest_id UUID REFERENCES guests(id),
  user_id UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  filename TEXT
);

-- RLS Policies for photos
CREATE POLICY "Guests can view photos for their events"
  ON photos FOR SELECT
  USING (
    guest_id IN (
      SELECT g.id FROM guests g 
      WHERE g.invitation_id = auth.jwt() ->> 'invitation_id'
    )
    OR
    event_id IN (
      SELECT e.id FROM events e 
      INNER JOIN guests g ON g.event_id = e.id 
      WHERE g.invitation_id = auth.jwt() ->> 'invitation_id'
    )
  );

CREATE POLICY "Guests can upload photos to their events"
  ON photos FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e 
      INNER JOIN guests g ON g.event_id = e.id 
      WHERE g.invitation_id = auth.jwt() ->> 'invitation_id'
    )
  );
```

## Test Cases for Photo Upload Flow

1. **Camera Capture & Upload**
   - Take photo using camera interface
   - Verify preview appears
   - Confirm upload button working
   - Check upload progress indicator
   - Verify success confirmation
   - Confirm photo appears in gallery

2. **File Selection & Upload**
   - Select photo from device
   - Verify preview appears
   - Confirm upload button working
   - Check upload progress indicator
   - Verify success confirmation
   - Confirm photo appears in gallery

3. **Error Handling**
   - Test with slow network connection
   - Cancel upload midway
   - Test with very large images
   - Test with unsupported file types
   - Check error messages appear correctly
   - Verify retry functionality works

4. **Gallery Functionality**
   - Check loading states display correctly
   - Verify recently uploaded photos appear
   - Test pagination/infinite scroll
   - Check image display quality
   - Verify empty state displays correctly
   - Test performance with many photos

## API Endpoints for Testing

1. **Upload Initialization**
   - Endpoint: `POST /api/guest/upload/init`
   - Purpose: Initialize upload and get signed URL
   - Required data: `eventId`, `fileType`, `fileName`, `fileSize`
   - Response: `uploadUrl`, `photoId`, `fields`

2. **Upload Confirmation**
   - Endpoint: `POST /api/guest/upload/confirm`
   - Purpose: Confirm upload completion and create database record
   - Required data: `photoId`, `eventId`
   - Response: Success status, gallery URL

3. **Gallery Fetch**
   - Endpoint: `GET /api/guest/gallery?eventId=<event_id>`
   - Purpose: Fetch photos for an event's gallery
   - Query params: `eventId`, `limit`, `cursor`
   - Response: Array of photo objects, pagination cursor

## Testing Utilities

- **Browser DevTools**
  - Network tab for monitoring requests
  - Console for JavaScript errors
  - Application tab for checking storage
  - Performance tab for profiling

- **Supabase Dashboard**
  - Database explorer for examining records
  - Storage browser for checking uploaded files
  - SQL editor for running queries
  - Logs for authentication issues

- **Simulated Conditions**
  - Chrome DevTools network throttling
  - Airplane mode toggle for testing offline
  - Camera permission toggling
  - Storage quota testing

## Common Issues to Watch For

1. **Permission Issues**
   - Camera access denials
   - Storage permissions problems
   - Database RLS policy restrictions
   - Storage bucket access controls

2. **Token Related Problems**
   - Token expiration during long uploads
   - Missing token in API requests
   - Incorrect event or guest association
   - Authentication context loss between pages

3. **Performance Issues**
   - Large file upload handling
   - Gallery loading with many photos
   - Memory usage with camera preview
   - Excessive re-renders in gallery view

4. **UI/UX Concerns**
   - Missing loading indicators
   - Unclear error messages
   - Inconsistent success feedback
   - Navigation issues after upload

## Debugging Strategies

1. **API Response Inspection**
   - Add detailed `console.log` for API responses
   - Check Network tab for request/response data
   - Verify status codes and response bodies
   - Examine request headers for token presence

2. **Database Record Verification**
   - Run SQL queries to check record creation
   - Verify correct event_id and guest_id values
   - Check URL fields for correct paths
   - Test RLS policies directly

3. **Storage Inspection**
   - Check Supabase Storage for uploaded files
   - Verify file paths match database records
   - Check permissions on storage buckets
   - Test direct URL access to files

4. **Token Context Validation**
   - Log token context throughout the flow
   - Verify token preservation between pages
   - Check token claims for correct values
   - Test token refresh mechanism

## Diagnostic Queries

```sql
-- Check photos associated with event
SELECT * FROM photos 
WHERE event_id = 'your-event-id' 
ORDER BY created_at DESC;

-- Check photos uploaded by specific guest
SELECT p.* FROM photos p
JOIN guests g ON p.guest_id = g.id
WHERE g.invitation_id = 'your-invitation-id'
ORDER BY p.created_at DESC;

-- Check storage paths for uploaded photos
SELECT id, storage_path, url 
FROM photos 
WHERE event_id = 'your-event-id'
ORDER BY created_at DESC;

-- Verify event association for guest
SELECT g.id as guest_id, g.name, e.id as event_id, e.name as event_name
FROM guests g
JOIN events e ON g.event_id = e.id
WHERE g.invitation_id = 'your-invitation-id';
```

## Key Testing Functions

```typescript
// Test camera access
async function testCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Camera access success:", stream);
    return stream;
  } catch (error) {
    console.error("Camera access error:", error);
    return null;
  }
}

// Test photo upload
async function testPhotoUpload(file, eventId, guestId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('guestId', guestId);
    
    const response = await fetch('/api/guest/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log("Upload result:", result);
    return result;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}

// Test gallery fetch
async function testGalleryFetch(eventId) {
  try {
    const response = await fetch(`/api/guest/gallery?eventId=${eventId}`);
    const photos = await response.json();
    console.log("Gallery photos:", photos);
    return photos;
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return [];
  }
}
```

This resource directory map provides a comprehensive guide for testing and troubleshooting the guest photo upload system and gallery integration. Use it to systematically identify and resolve issues during the Session 42-B QA process. 