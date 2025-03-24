-- Migration: Create media table and migrate from photos
-- Description: Converts photos table to a more flexible media table supporting both photos and videos

-- Step 1: Create the new media table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  storage_path TEXT NOT NULL,
  file_path TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- New field for videos (in seconds)
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_approved BOOLEAN DEFAULT false, -- For backward compatibility
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_media_event_id ON public.media(event_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON public.media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_status ON public.media(status);

-- Step 3: Migrate data from photos table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'photos') THEN
    INSERT INTO public.media (
      id, 
      event_id, 
      media_type, 
      storage_path, 
      file_path, 
      url, 
      thumbnail_url,
      size, 
      mime_type, 
      width, 
      height, 
      user_id, 
      is_approved, 
      status,
      metadata,
      created_at, 
      updated_at
    )
    SELECT
      id, 
      event_id, 
      'photo', 
      storage_path, 
      storage_path, -- Use storage_path as file_path for backward compatibility
      COALESCE(url, ''), -- Ensure not null
      thumbnail_url,
      size, 
      mime_type, 
      width, 
      height, 
      uploaded_by, 
      is_approved,
      CASE 
        WHEN is_approved THEN 'approved'
        ELSE 'pending'
      END,
      metadata,
      created_at, 
      updated_at
    FROM public.photos;
  END IF;
END
$$;

-- Step 4: Add RLS policies
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Organizers can view all media for their events
CREATE POLICY "Organizers can view all media for their events"
ON public.media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = media.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Approved media are visible to event attendees
CREATE POLICY "Attendees can view approved media"
ON public.media
FOR SELECT
USING (
  (status = 'approved' OR is_approved = true) AND
  EXISTS (
    SELECT 1 FROM public.event_attendees
    WHERE event_attendees.event_id = media.event_id
    AND event_attendees.user_id = auth.uid()
  )
);

-- Users can view their own uploads
CREATE POLICY "Users can view their own uploads"
ON public.media
FOR SELECT
USING (user_id = auth.uid());

-- Users can upload media to events they're attending
CREATE POLICY "Users can upload media to events they're attending"
ON public.media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.event_attendees
    WHERE event_attendees.event_id = media.event_id
    AND event_attendees.user_id = auth.uid()
  )
);

-- Users can update their own uploads
CREATE POLICY "Users can update their own uploads"
ON public.media
FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON public.media
FOR DELETE
USING (user_id = auth.uid());

-- Organizers can update approval status
CREATE POLICY "Organizers can update approval status"
ON public.media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = media.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Step 5: Create a function to keep is_approved in sync with status
CREATE OR REPLACE FUNCTION public.sync_media_approval_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.is_approved = false THEN
    NEW.is_approved := true;
  ELSIF NEW.status != 'approved' AND NEW.is_approved = true THEN
    NEW.is_approved := false;
  ELSIF NEW.is_approved = true AND NEW.status != 'approved' THEN
    NEW.status := 'approved';
  ELSIF NEW.is_approved = false AND NEW.status = 'approved' THEN
    NEW.status := 'pending';
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to keep approval status in sync
CREATE TRIGGER sync_media_approval_status
BEFORE INSERT OR UPDATE ON public.media
FOR EACH ROW
EXECUTE FUNCTION public.sync_media_approval_status();

-- Step 6: Create functions for media stats
CREATE OR REPLACE FUNCTION public.get_event_media_count(event_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.media
    WHERE media.event_id = get_event_media_count.event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_event_approved_media_count(event_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.media
    WHERE media.event_id = get_event_approved_media_count.event_id
    AND (media.status = 'approved' OR media.is_approved = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create view for media with events
CREATE OR REPLACE VIEW public.media_with_events AS
SELECT 
  m.*,
  e.name AS event_name,
  e.date AS event_date,
  e.organizer_id AS event_organizer_id
FROM public.media m
JOIN public.events e ON m.event_id = e.id;

-- Step 8: Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  cover_media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for albums
CREATE INDEX IF NOT EXISTS idx_albums_event_id ON public.albums(event_id);
CREATE INDEX IF NOT EXISTS idx_albums_created_by ON public.albums(created_by);

-- Create album_media join table
CREATE TABLE IF NOT EXISTS public.album_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(album_id, media_id)
);

-- Create indexes for album_media
CREATE INDEX IF NOT EXISTS idx_album_media_album_id ON public.album_media(album_id);
CREATE INDEX IF NOT EXISTS idx_album_media_media_id ON public.album_media(media_id);

-- Enable RLS on albums and album_media
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_media ENABLE ROW LEVEL SECURITY;

-- RLS policies for albums
CREATE POLICY "Organizers can manage albums"
ON public.albums
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = albums.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Users can create albums for events they're attending"
ON public.albums
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.event_attendees
    WHERE event_attendees.event_id = albums.event_id
    AND event_attendees.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own albums"
ON public.albums
FOR ALL
USING (created_by = auth.uid());

CREATE POLICY "Public albums are visible to event attendees"
ON public.albums
FOR SELECT
USING (
  is_public = true AND
  EXISTS (
    SELECT 1 FROM public.event_attendees
    WHERE event_attendees.event_id = albums.event_id
    AND event_attendees.user_id = auth.uid()
  )
);

-- RLS policies for album_media
CREATE POLICY "Album owners can manage album media"
ON public.album_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.albums
    WHERE albums.id = album_media.album_id
    AND albums.created_by = auth.uid()
  )
);

CREATE POLICY "Event organizers can manage album media"
ON public.album_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.albums
    JOIN public.events ON albums.event_id = events.id
    WHERE albums.id = album_media.album_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Users can view media in public albums they have access to"
ON public.album_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.albums
    JOIN public.events ON albums.event_id = events.id
    LEFT JOIN public.event_attendees ON events.id = event_attendees.event_id
    WHERE albums.id = album_media.album_id
    AND (
      albums.is_public = true AND
      event_attendees.user_id = auth.uid()
    )
  )
);

-- Step 9: Create moderation log table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'delete')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for moderation logs
CREATE INDEX IF NOT EXISTS idx_moderation_logs_media_id ON public.moderation_logs(media_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_user_id ON public.moderation_logs(user_id);

-- Enable RLS on moderation logs
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for moderation logs
CREATE POLICY "Event organizers can view moderation logs"
ON public.moderation_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.media
    JOIN public.events ON media.event_id = events.id
    WHERE media.id = moderation_logs.media_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Users can create moderation logs for events they organize"
ON public.moderation_logs
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.media
    JOIN public.events ON media.event_id = events.id
    WHERE media.id = moderation_logs.media_id
    AND events.organizer_id = auth.uid()
  )
);

-- Step 10: Add comment for easy identification
COMMENT ON TABLE public.media IS 'Stores both photos and videos with type discrimination'; 