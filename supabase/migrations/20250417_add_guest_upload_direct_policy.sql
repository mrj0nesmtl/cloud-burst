-- Migration: Add direct guest upload policy for debugging
BEGIN;

-- This is a more permissive policy for debugging purposes
-- It allows any upload with a valid invitation token in metadata
CREATE POLICY "Guest direct upload via token (debug)" ON media
FOR INSERT
WITH CHECK (
  -- For any row with a valid invitation token in metadata
  (metadata->>'invitation_token') IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM invitations i
    WHERE i.token = (metadata->>'invitation_token')
  )
);

-- This function logs media upload attempts for debugging
CREATE OR REPLACE FUNCTION log_media_upload_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a log entry
  INSERT INTO moderation_logs (
    media_id,
    status,
    reason
  ) VALUES (
    NEW.id,
    'attempt',
    format('Upload attempt with metadata: %s', NEW.metadata::text)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log all media upload attempts
CREATE TRIGGER media_upload_attempt_logger
BEFORE INSERT ON media
FOR EACH ROW
EXECUTE FUNCTION log_media_upload_attempt();

COMMIT; 