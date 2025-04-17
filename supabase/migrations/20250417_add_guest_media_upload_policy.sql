-- Migration: Add guest upload policy for media table
BEGIN;

-- This policy allows guests with valid invitation tokens to upload media
-- The invitation token must be included in the media metadata
CREATE POLICY "Guest upload via invitation token" ON media
FOR INSERT
WITH CHECK (
  (metadata->>'invitation_token') IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM invitations i
    WHERE i.token = (metadata->>'invitation_token')
    AND i.event_id = media.event_id
    AND (i.expires_at IS NULL OR i.expires_at > NOW())
  )
);

-- Add function to handle guest media uploads with invitation token
CREATE OR REPLACE FUNCTION handle_guest_media_upload(
  p_event_id UUID,
  p_invitation_token TEXT,
  p_storage_path TEXT,
  p_url TEXT,
  p_filename TEXT,
  p_original_filename TEXT,
  p_size_bytes INTEGER,
  p_content_type TEXT,
  p_media_type TEXT DEFAULT 'photo',
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_caption TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_media_id UUID;
  v_invitation_id UUID;
BEGIN
  -- Verify invitation token is valid
  SELECT id INTO v_invitation_id
  FROM invitations
  WHERE token = p_invitation_token
  AND event_id = p_event_id
  AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation token';
  END IF;
  
  -- Add invitation token to metadata
  p_metadata := jsonb_set(
    p_metadata, 
    '{invitation_token}', 
    to_jsonb(p_invitation_token)
  );
  
  -- Insert the media record
  INSERT INTO media (
    event_id,
    storage_path,
    url,
    filename,
    original_filename,
    size_bytes,
    content_type,
    media_type,
    width,
    height,
    duration_seconds,
    caption,
    metadata,
    is_public,
    moderation_status
  ) VALUES (
    p_event_id,
    p_storage_path,
    p_url,
    p_filename,
    p_original_filename,
    p_size_bytes,
    p_content_type,
    p_media_type,
    p_width,
    p_height,
    p_duration_seconds,
    p_caption,
    p_metadata,
    true,  -- Guest uploads are public by default
    'pending'  -- Pending moderation
  )
  RETURNING id INTO v_media_id;
  
  RETURN v_media_id;
END;
$$;

-- Grant execute permission on the function to authenticated and anon users
GRANT EXECUTE ON FUNCTION handle_guest_media_upload TO authenticated, anon;

COMMIT; 