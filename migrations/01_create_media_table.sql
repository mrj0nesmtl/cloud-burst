-- Migration: Create Media Table
-- This migration renames the photos table to media and adds support for video content

-- First, create the new media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- Video duration in seconds
  metadata JSONB,
  mime_type TEXT,
  is_public BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- If there's an existing photos table, migrate data (if this is an update)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photos') THEN
    -- Migrate data from photos to media
    INSERT INTO media (
      id,
      event_id,
      user_id,
      media_type,
      file_path,
      url,
      thumbnail_url,
      title,
      description,
      size,
      width,
      height,
      is_public,
      status,
      created_at,
      updated_at
    )
    SELECT 
      id,
      event_id,
      user_id,
      'photo' as media_type,
      COALESCE(storage_path, '') as file_path,
      url,
      NULL as thumbnail_url,
      title,
      description,
      size,
      width,
      height,
      COALESCE(is_approved, false) as is_public,
      CASE
        WHEN status = 'approved' THEN 'approved'
        WHEN status = 'rejected' THEN 'rejected'
        ELSE 'pending'
      END as status,
      created_at,
      updated_at
    FROM photos;
    
    -- Drop the photos table after migration (optional, can be commented out for safety)
    -- DROP TABLE photos;
  END IF;
END
$$;

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
CREATE INDEX IF NOT EXISTS idx_media_event_id ON media (event_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media (user_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON media (status);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON media (media_type);
CREATE INDEX IF NOT EXISTS idx_albums_event_id ON albums (event_id);
CREATE INDEX IF NOT EXISTS idx_album_media_album_id ON album_media (album_id);
CREATE INDEX IF NOT EXISTS idx_album_media_media_id ON album_media (media_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_media_id ON moderation_logs (media_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_event_id ON moderation_logs (event_id);

-- Set up RLS (Row Level Security) policies

-- Media RLS policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view approved public media or their own media
CREATE POLICY "Users can view approved public media or their own media"
  ON media FOR SELECT
  USING (
    (status = 'approved' AND is_public = true) OR
    (user_id = auth.uid())
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
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own media
CREATE POLICY "Users can update their own media"
  ON media FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

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
  USING (user_id = auth.uid());

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