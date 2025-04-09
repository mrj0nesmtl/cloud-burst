-- Migration: Set up comprehensive storage bucket structure
BEGIN;

-- Create required storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('event-assets', 'event-assets', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('event-photos', 'event-photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']),
  ('profile-photos', 'profile-photos', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('temp-uploads', 'temp-uploads', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for event-assets bucket
CREATE POLICY "Event assets are viewable by event participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'event-assets'
  AND (
    -- Check if user is event staff, host, or organizer
    EXISTS (
      SELECT 1 FROM event_staff es
      WHERE es.event_id = (storage.foldername(name))[1]::uuid
      AND es.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM events e
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = (storage.foldername(name))[1]::uuid
      AND (
        (p.role = 'event_host' AND e.organizer_id = auth.uid())
        OR p.role IN ('organizer', 'admin', 'super_admin')
      )
    )
  )
);

-- Set up storage policies for event-photos bucket
CREATE POLICY "Event photos are manageable by staff and organizers"
ON storage.objects FOR ALL
USING (
  bucket_id = 'event-photos'
  AND (
    -- Allow event staff to manage their event's photos
    EXISTS (
      SELECT 1 FROM event_staff es
      WHERE es.event_id = (storage.foldername(name))[1]::uuid
      AND es.user_id = auth.uid()
    )
    OR
    -- Allow event hosts and organizers
    EXISTS (
      SELECT 1 FROM events e
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = (storage.foldername(name))[1]::uuid
      AND (
        (p.role = 'event_host' AND e.organizer_id = auth.uid())
        OR p.role IN ('organizer', 'admin', 'super_admin')
      )
    )
  )
);

-- Set up storage policies for profile-photos bucket
CREATE POLICY "Users can manage their own profile photos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up storage policies for temp-uploads bucket
CREATE POLICY "Temporary uploads are private to the uploader"
ON storage.objects FOR ALL
USING (
  bucket_id = 'temp-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage folders structure function
CREATE OR REPLACE FUNCTION storage.create_event_folders(event_id UUID)
RETURNS void AS $$
BEGIN
  -- Create event folders in event-assets
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES 
    ('event-assets', event_id || '/logos/', auth.uid(), '{"content-type": "application/x-directory"}'),
    ('event-assets', event_id || '/documents/', auth.uid(), '{"content-type": "application/x-directory"}'),
    ('event-assets', event_id || '/templates/', auth.uid(), '{"content-type": "application/x-directory"}');
    
  -- Create event folders in event-photos
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES 
    ('event-photos', event_id || '/raw/', auth.uid(), '{"content-type": "application/x-directory"}'),
    ('event-photos', event_id || '/processed/', auth.uid(), '{"content-type": "application/x-directory"}'),
    ('event-photos', event_id || '/approved/', auth.uid(), '{"content-type": "application/x-directory"}'),
    ('event-photos', event_id || '/featured/', auth.uid(), '{"content-type": "application/x-directory"}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT; 