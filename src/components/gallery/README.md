# Cloud Burst Gallery System

The gallery system provides a comprehensive solution for managing media (photos and videos) within events. It includes components for displaying, uploading, and moderating media content.

## Core Components

### Media Store

The media store (`src/store/media-store.ts`) is a Zustand store that manages the state of media items, including:

- Fetching media for events
- Managing media approval status
- Handling uploads
- Filtering and sorting media

### Display Components

- **MediaCard**: Displays a single media item with various options for showing metadata and controls.
- **MediaGrid**: Displays a grid of media items with support for filtering, sorting, and moderation.
- **MediaLightbox**: Provides a full-screen view of media items with navigation controls.

### Upload Components

- **MediaUpload**: Handles file uploads with drag-and-drop support, progress tracking, and validation.
- **UploadContent**: Client-side component for the upload page with recent uploads display.

### Moderation Components

- **MediaModeration**: Allows event organizers to approve or reject media uploads.
- **ModerationContent**: Client-side component for the moderation page.

## Pages

- **Event Gallery Page**: Displays approved media for an event.
- **Upload Page**: Allows users to upload media to an event.
- **Moderation Page**: Allows event organizers to moderate media uploads.

## Media Types

The system supports two types of media:
- Photos (images in various formats)
- Videos (MP4, WebM, etc.)

## Media Status

Media items can have one of three statuses:
- **Pending**: Newly uploaded media awaiting approval
- **Approved**: Media that has been approved by the event organizer
- **Rejected**: Media that has been rejected by the event organizer

## Usage

### Displaying Media

```tsx
import { MediaGrid } from '@/components/gallery'

// In your component
<MediaGrid 
  media={mediaItems} 
  isLoading={loading}
  emptyMessage="No media found"
/>
```

### Uploading Media

```tsx
import { MediaUpload } from '@/components/gallery'

// In your component
<MediaUpload
  eventId={eventId}
  userId={userId}
  onUploadComplete={handleUploadComplete}
  acceptedMediaTypes={['photo', 'video']}
  maxFileSizeMB={50}
  maxFiles={100}
/>
```

### Moderating Media

```tsx
import { MediaModeration } from '@/components/gallery'

// In your component
<MediaModeration
  eventId={eventId}
  userId={userId}
  isOrganizer={isOrganizer}
/>
```

## Backend Integration

The gallery system integrates with Supabase for:
- Storage of media files
- Database records for media metadata
- Row-level security for access control

## Accessibility

All components are built with accessibility in mind, including:
- Proper ARIA attributes
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Mobile Responsiveness

The gallery system is fully responsive and works well on all device sizes, with special attention to touch interactions on mobile devices. 