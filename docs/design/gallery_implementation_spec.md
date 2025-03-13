# Gallery Implementation Technical Specification

## Overview

The Gallery feature is a core component of the Cloud Burst platform, allowing event photographers to upload, organize, and showcase their photos for event attendees. This document outlines the technical requirements and implementation plan for the Gallery feature.

## Current Status

- Gallery layout implemented with proper padding
- Directory structure created:
  - `/protected/gallery/` (main gallery page)
  - `/protected/gallery/all/` (all photos view)
  - `/protected/gallery/events/` (events list view)
  - `/protected/gallery/albums/` (albums view)
  - `/protected/gallery/moderate/` (moderation interface)
- Basic navigation established in sidebar

## Technical Requirements

### 1. Photo Upload System

#### Backend Requirements
- Supabase Storage bucket configuration with appropriate RLS policies
- File size limits and validation (10MB per photo)
- Support for JPEG, PNG, WebP formats
- Support for EXIF data extraction
- Serverless function for image optimization

#### Frontend Components
- Drag-and-drop upload zone
- Multi-file upload support
- Upload progress indicator
- Error handling for failed uploads
- Cancellation capability

#### Implementation
```typescript
// Upload component structure
interface UploadProps {
  eventId: string;
  onComplete: (uploadedFiles: UploadedFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  uploadedAt: Date;
}
```

### 2. Album Management

#### Data Model
```typescript
interface Album {
  id: string;
  name: string;
  description?: string;
  eventId: string;
  coverPhotoId?: string;
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}
```

#### Frontend Components
- Album creation form
- Album editor
- Photo selection interface
- Cover photo selector
- Album grid view

### 3. Photo Moderation

#### Features
- Approval/rejection workflow
- Batch operations
- NSFW detection (AI-assisted)
- Moderation logs
- Notification system for photographers

#### Implementation
```typescript
enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

interface ModerationAction {
  photoId: string;
  status: ModerationStatus;
  moderatorId: string;
  reason?: string;
  timestamp: Date;
}
```

### 4. Gallery Views

#### View Types
1. **Grid View**: Standard responsive grid layout
2. **Masonry View**: Pinterest-style variable height layout
3. **Carousel View**: Full-screen slideshow experience
4. **Filmstrip View**: Horizontal scrolling thumbnails with large preview

#### Implementation
- Dynamic layout switching
- Persistent view preference storage
- Responsive design for all device types
- Virtualized lists for performance
- Lazy loading of images
- Preloading of adjacent images in slideshow

### 5. Filtering and Search

#### Features
- Search by caption, tag, or metadata
- Filter by date, event, album
- Sort by upload date, capture date, popularity
- Advanced filtering with multiple criteria

#### Implementation
```typescript
interface FilterOptions {
  search?: string;
  eventId?: string;
  albumId?: string;
  dateRange?: [Date, Date];
  tags?: string[];
  sortBy: 'uploadDate' | 'captureDate' | 'popularity';
  sortDirection: 'asc' | 'desc';
}
```

## Database Schema Updates

```sql
-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  content_type TEXT NOT NULL,
  caption TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photo Tags
CREATE TABLE photo_tags (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (photo_id, tag)
);

-- Moderation Logs
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## RLS Policies

```sql
-- Photos table policies
CREATE POLICY "Users can view their own photos" ON photos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view event photos" ON photos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = photos.event_id
    AND events.organizer_id = auth.uid()
  ));

CREATE POLICY "Public photos are viewable by anyone" ON photos
  FOR SELECT
  USING (is_public = TRUE);

-- Similar policies for other tables
```

## Implementation Phases

### Phase 1: Core Photo Management
1. Implement photo upload component
2. Create basic gallery grid view
3. Add photo detail view
4. Implement basic filtering

### Phase 2: Album Management
1. Implement album creation/editing
2. Create album view page
3. Develop photo-to-album assignment
4. Add cover photo selection

### Phase 3: Moderation System
1. Create moderation queue interface
2. Implement approval/rejection workflow
3. Add batch moderation capabilities
4. Create moderation logs

### Phase 4: Advanced Features
1. Implement AI tagging suggestions
2. Add advanced search functionality
3. Create customizable gallery settings
4. Build gallery sharing capabilities

## Testing Considerations

- Test with large image sets (1000+ photos)
- Verify lazy loading performance
- Test on low-bandwidth connections
- Verify storage security measures
- Test concurrent uploads from multiple users

## Accessibility Requirements

- All images must have alternative text
- Keyboard navigation for galleries
- Screen reader support for gallery views
- Focus management for modal dialogs
- ARIA attributes for interactive elements

## Technical Debt and Future Enhancements

- Face recognition for person tagging
- Automatic image categorization
- Advanced image editing capabilities
- Video support
- Mobile app integration

## Final Deliverables

1. Fully functional gallery management system
2. Photo upload mechanism with progress tracking
3. Album creation and management interface
4. Moderation system for event organizers
5. Multiple gallery view options
6. Search and filtering capabilities
7. Documentation for usage and maintenance

## Timeline

- **March 19-21**: Implement photo upload system and basic gallery view
- **March 22-23**: Complete album management features
- **March 24-25**: Implement moderation system
- **March 26-27**: Add advanced filtering and search
- **March 28-31**: Testing, optimization, and documentation 