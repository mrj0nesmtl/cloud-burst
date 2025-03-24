-- Migration: Update Media Table Schema
-- This migration updates the existing media table and adds related tables

-- Step 1: Add missing columns
ALTER TABLE media 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Step 2: Copy is_approved to status for existing records
UPDATE media SET status = 
  CASE 
    WHEN is_approved = true THEN 'approved'
    ELSE 'pending'
  END
WHERE status IS NULL OR status = '';

-- Note: We're not renaming columns since the application is using the existing names
-- Instead, we'll update our TypeScript types to match the database

-- Create albums table for organizing media
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create album_media table for associating media with albums
CREATE TABLE IF NOT EXISTS album_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (album_id, media_id)
);

-- Create moderation_logs table for tracking moderation actions
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_albums_event_id ON albums (event_id);
CREATE INDEX IF NOT EXISTS idx_album_media_album_id ON album_media (album_id);
CREATE INDEX IF NOT EXISTS idx_album_media_media_id ON album_media (media_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_media_id ON moderation_logs (media_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_event_id ON moderation_logs (event_id);

-- Set up RLS (Row Level Security) policies

-- Media RLS policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view approved public media or their own media" ON media;
DROP POLICY IF EXISTS "Event organizers can view all media for their events" ON media;
DROP POLICY IF EXISTS "Users can insert their own media" ON media;
DROP POLICY IF EXISTS "Users can update their own media" ON media;
DROP POLICY IF EXISTS "Event organizers can update any media for their events" ON media;
DROP POLICY IF EXISTS "Users can delete their own media" ON media;
DROP POLICY IF EXISTS "Event organizers can delete any media for their events" ON media;

-- Policy: Authenticated users can view approved public media or their own media
CREATE POLICY "Users can view approved public media or their own media"
  ON media FOR SELECT
  USING (
    (status = 'approved' AND is_public = true) OR
    (uploaded_by = auth.uid())
  );

-- Policy: Only event organizers can view all media for an event
CREATE POLICY "Event organizers can view all media for their events"
  ON media FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Policy: Users can insert their own media
CREATE POLICY "Users can insert their own media"
  ON media FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Policy: Users can update their own media
CREATE POLICY "Users can update their own media"
  ON media FOR UPDATE
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Policy: Event organizers can update any media for their events
CREATE POLICY "Event organizers can update any media for their events"
  ON media FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Policy: Users can delete their own media
CREATE POLICY "Users can delete their own media"
  ON media FOR DELETE
  USING (uploaded_by = auth.uid());

-- Policy: Event organizers can delete any media for their events
CREATE POLICY "Event organizers can delete any media for their events"
  ON media FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Albums RLS policies
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Drop existing album policies
DROP POLICY IF EXISTS "Users can view public albums" ON albums;
DROP POLICY IF EXISTS "Event organizers can view all albums for their events" ON albums;
DROP POLICY IF EXISTS "Event organizers can insert albums for their events" ON albums;
DROP POLICY IF EXISTS "Event organizers can update albums for their events" ON albums;
DROP POLICY IF EXISTS "Event organizers can delete albums for their events" ON albums;

-- Policy: Authenticated users can view public albums
CREATE POLICY "Users can view public albums"
  ON albums FOR SELECT
  USING (is_public = true);

-- Policy: Event organizers can view all albums for their events
CREATE POLICY "Event organizers can view all albums for their events"
  ON albums FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Policy: Event organizers can insert albums for their events
CREATE POLICY "Event organizers can insert albums for their events"
  ON albums FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Policy: Event organizers can update albums for their events
CREATE POLICY "Event organizers can update albums for their events"
  ON albums FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Policy: Event organizers can delete albums for their events
CREATE POLICY "Event organizers can delete albums for their events"
  ON albums FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Album media RLS policies
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;

-- Drop existing album_media policies
DROP POLICY IF EXISTS "Users can view album_media for public albums" ON album_media;
DROP POLICY IF EXISTS "Event organizers can view all album_media for their events" ON album_media;
DROP POLICY IF EXISTS "Event organizers can insert album_media for their events" ON album_media;
DROP POLICY IF EXISTS "Event organizers can update album_media for their events" ON album_media;
DROP POLICY IF EXISTS "Event organizers can delete album_media for their events" ON album_media;

-- Policy: Users can view album_media for public albums
CREATE POLICY "Users can view album_media for public albums"
  ON album_media FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM albums WHERE is_public = true
    )
  );

-- Policy: Event organizers can view all album_media for their events
CREATE POLICY "Event organizers can view all album_media for their events"
  ON album_media FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM albums 
      WHERE event_id IN (
        SELECT id FROM events 
        WHERE user_id = auth.uid() OR 
              id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
      )
    )
  );

-- Policy: Event organizers can insert album_media for their events
CREATE POLICY "Event organizers can insert album_media for their events"
  ON album_media FOR INSERT
  WITH CHECK (
    album_id IN (
      SELECT id FROM albums 
      WHERE event_id IN (
        SELECT id FROM events 
        WHERE user_id = auth.uid() OR 
              id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
      )
    )
  );

-- Policy: Event organizers can update album_media for their events
CREATE POLICY "Event organizers can update album_media for their events"
  ON album_media FOR UPDATE
  USING (
    album_id IN (
      SELECT id FROM albums 
      WHERE event_id IN (
        SELECT id FROM events 
        WHERE user_id = auth.uid() OR 
              id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
      )
    )
  );

-- Policy: Event organizers can delete album_media for their events
CREATE POLICY "Event organizers can delete album_media for their events"
  ON album_media FOR DELETE
  USING (
    album_id IN (
      SELECT id FROM albums 
      WHERE event_id IN (
        SELECT id FROM events 
        WHERE user_id = auth.uid() OR 
              id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
      )
    )
  );

-- Moderation logs RLS policies
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing moderation_logs policies
DROP POLICY IF EXISTS "Event organizers can view moderation logs for their events" ON moderation_logs;
DROP POLICY IF EXISTS "Event organizers can insert moderation logs for their events" ON moderation_logs;

-- Policy: Event organizers can view moderation logs for their events
CREATE POLICY "Event organizers can view moderation logs for their events"
  ON moderation_logs FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  );

-- Policy: Event organizers can insert moderation logs for their events
CREATE POLICY "Event organizers can insert moderation logs for their events"
  ON moderation_logs FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events 
      WHERE user_id = auth.uid() OR 
            id IN (SELECT event_id FROM event_staff WHERE user_id = auth.uid())
    )
  ); 