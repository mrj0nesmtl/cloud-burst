# Media Schema Migration Plan

## Overview

This document outlines the plan for migrating the existing `photos` table to a more flexible `media` table that can accommodate both photos and videos. This decision supports Cloud Burst's future roadmap while minimizing code duplication and technical debt.

## Current State

The `photos` table currently has the following structure:

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,
  size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Migration Steps

### 1. Create the new `media` table

```sql
-- Create media table with type discriminator
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')), -- New field
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,
  size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- New field for videos (in seconds)
  uploaded_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_created_at ON media(created_at);
CREATE INDEX idx_media_media_type ON media(media_type);
```

### 2. Migrate data from `photos` to `media`

```sql
-- Insert all existing photos into the media table
INSERT INTO media (
  id, event_id, media_type, storage_path, filename, url, thumbnail_url,
  size, mime_type, width, height, uploaded_by, is_approved, metadata,
  created_at, updated_at
)
SELECT
  id, event_id, 'photo', storage_path, filename, url, thumbnail_url,
  size, mime_type, width, height, uploaded_by, is_approved, metadata,
  created_at, updated_at
FROM photos;
```

### 3. Update RLS Policies

```sql
-- Add RLS policies for the media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policy for organizers (can see all media for their events)
CREATE POLICY "Organizers can view all media for their events"
ON media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = media.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Policy for approved media (visible to event attendees)
CREATE POLICY "Attendees can view approved media"
ON media
FOR SELECT
USING (
  is_approved = true AND
  EXISTS (
    SELECT 1 FROM event_attendees
    WHERE event_attendees.event_id = media.event_id
    AND event_attendees.user_id = auth.uid()
  )
);

-- Policy for uploaders (can view their own uploads)
CREATE POLICY "Users can view their own uploads"
ON media
FOR SELECT
USING (uploaded_by = auth.uid());

-- Policy for uploads (users can upload media to events they're attendees of)
CREATE POLICY "Users can upload media to events they're attending"
ON media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_attendees
    WHERE event_attendees.event_id = media.event_id
    AND event_attendees.user_id = auth.uid()
  )
);

-- Policy for updates (users can update their own uploads)
CREATE POLICY "Users can update their own uploads"
ON media
FOR UPDATE
USING (uploaded_by = auth.uid());

-- Policy for deletes (users can delete their own uploads)
CREATE POLICY "Users can delete their own uploads"
ON media
FOR DELETE
USING (uploaded_by = auth.uid());

-- Policy for organizers (can approve/reject media)
CREATE POLICY "Organizers can update approval status"
ON media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = media.event_id
    AND events.organizer_id = auth.uid()
  )
);
```

### 4. Update TypeScript Interfaces

Update `src/types/events.ts` to use the new Media interface:

```typescript
export type MediaType = 'photo' | 'video';

export interface Media {
  id: string;
  event_id: string;
  media_type: MediaType;
  storage_path: string;
  filename: string;
  url?: string;
  thumbnail_url?: string;
  size?: number;
  mime_type?: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null; // for videos
  uploaded_by: string | null;
  is_approved: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  event?: {
    id: string;
    name: string;
    date: string;
  };
}

// For backward compatibility
export interface Photo extends Omit<Media, 'media_type'> {
  media_type: 'photo';
}

export interface Video extends Omit<Media, 'media_type'> {
  media_type: 'video';
  duration: number;
}

export interface MediaWithEvent extends Media {
  event: Event;
}

export interface MediaWithUploader extends Media {
  uploader: UserProfile | null;
}

export interface CreateMediaParams {
  event_id: string;
  media_type: MediaType;
  storage_path: string;
  filename: string;
  size: number;
  mime_type: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  uploaded_by?: string | null;
  is_approved?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateMediaParams {
  storage_path?: string;
  filename?: string;
  size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number;
  is_approved?: boolean;
  metadata?: Record<string, any>;
}
```

### 5. Create Supabase functions for the media table

Update `src/lib/supabase/media.ts` and `src/lib/supabase/media.server.ts` with functions for handling media:

```typescript
// Common functions for both files:
export function mapDbMediaToMedia(media: MediaRow): Media {
  // Extract metadata or use empty object
  const metadata = media.metadata as MediaMetadata || {};
  
  return {
    id: media.id,
    event_id: media.event_id,
    media_type: media.media_type,
    filename: media.filename,
    storage_path: media.storage_path,
    url: media.url,
    thumbnail_url: media.thumbnail_url || undefined,
    size: media.size,
    mime_type: media.mime_type,
    width: media.width,
    height: media.height,
    duration: media.duration,
    uploaded_by: media.uploaded_by,
    created_at: media.created_at,
    updated_at: media.updated_at || media.created_at,
    is_approved: media.is_approved,
    metadata: metadata
  };
}
```

### 6. Update Storage Bucket Configuration

```typescript
// Create separate folders for photos and videos
const storagePath = `events/${eventId}/${media.media_type}s/${safeFileName}`;
```

## Testing Plan

1. Unit test all new media-related functions
2. Integration test the migration process
3. Test the type discrimination in the UI
4. Verify that existing photo-related functionality still works
5. Test all RLS policies to ensure proper access control

## Rollback Plan

If issues are discovered:

1. Keep both tables active during migration
2. Only switch to the new table once all tests pass
3. Maintain database triggers to sync changes between tables during the transition period

## Migration Timeline

1. Development & Testing: 2 days
2. Staging Environment Deployment: 1 day
3. Production Migration: 1 day (during low-traffic period)
4. Post-Migration Monitoring: 1 day 