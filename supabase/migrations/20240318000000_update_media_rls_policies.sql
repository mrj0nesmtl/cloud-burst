-- Migration: Update media RLS policies for invitation-based uploads
BEGIN;

-- Drop existing upload policy if it exists
DROP POLICY IF EXISTS "Users can upload media to events they're attending" ON media;

-- Create new upload policy that checks for valid invitation
CREATE POLICY "Users can upload media through valid invitations" ON media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM event_attendees ea
    INNER JOIN invitations i ON i.id = ea.invitation_id
    WHERE ea.event_id = media.event_id
    AND ea.user_id = auth.uid()
    AND i.status = 'used'
    AND (i.expires_at IS NULL OR i.expires_at > NOW())
  )
  OR
  EXISTS (
    SELECT 1 FROM events e
    INNER JOIN profiles p ON p.id = auth.uid()
    WHERE e.id = media.event_id
    AND (
      -- Allow event hosts
      (p.role = 'event_host' AND e.organizer_id = auth.uid())
      -- Allow admins and super_admins
      OR p.role IN ('super_admin', 'admin')
      -- Allow organizers
      OR p.role = 'organizer'
    )
  )
);

-- Update view policy to include invitation-based access
DROP POLICY IF EXISTS "Attendees can view approved media" ON media;
CREATE POLICY "Attendees can view media through valid invitations" ON media
FOR SELECT
USING (
  is_approved = true 
  AND (
    EXISTS (
      SELECT 1 FROM event_attendees ea
      INNER JOIN invitations i ON i.id = ea.invitation_id
      WHERE ea.event_id = media.event_id
      AND ea.user_id = auth.uid()
      AND i.status = 'used'
      AND (i.expires_at IS NULL OR i.expires_at > NOW())
    )
    OR
    EXISTS (
      SELECT 1 FROM events e
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = media.event_id
      AND (
        -- Allow event hosts
        (p.role = 'event_host' AND e.organizer_id = auth.uid())
        -- Allow admins and super_admins
        OR p.role IN ('super_admin', 'admin')
        -- Allow organizers
        OR p.role = 'organizer'
      )
    )
  )
);

COMMIT; 