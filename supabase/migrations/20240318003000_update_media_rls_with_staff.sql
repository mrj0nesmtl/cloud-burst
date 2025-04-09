-- Migration: Update media RLS policies to include event staff and align with storage
BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload media through valid invitations" ON media;
DROP POLICY IF EXISTS "Attendees can view media through valid invitations" ON media;

-- Create new upload policy
CREATE POLICY "Media upload permissions" ON media
FOR INSERT
WITH CHECK (
  -- Event staff can upload
  EXISTS (
    SELECT 1 FROM event_staff es
    WHERE es.event_id = media.event_id
    AND es.user_id = auth.uid()
  )
  OR
  -- Event hosts and organizers can upload
  EXISTS (
    SELECT 1 FROM events e
    INNER JOIN profiles p ON p.id = auth.uid()
    WHERE e.id = media.event_id
    AND (
      (p.role = 'event_host' AND e.organizer_id = auth.uid())
      OR p.role IN ('organizer', 'admin', 'super_admin')
    )
  )
  OR
  -- Invited guests can upload through valid invitations
  EXISTS (
    SELECT 1 FROM event_attendees ea
    INNER JOIN invitations i ON i.id = ea.invitation_id
    WHERE ea.event_id = media.event_id
    AND ea.user_id = auth.uid()
    AND i.status = 'used'
    AND (i.expires_at IS NULL OR i.expires_at > NOW())
  )
);

-- Create view policy
CREATE POLICY "Media view permissions" ON media
FOR SELECT
USING (
  is_approved = true 
  AND (
    -- Event staff can view
    EXISTS (
      SELECT 1 FROM event_staff es
      WHERE es.event_id = media.event_id
      AND es.user_id = auth.uid()
    )
    OR
    -- Event hosts and organizers can view
    EXISTS (
      SELECT 1 FROM events e
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE e.id = media.event_id
      AND (
        (p.role = 'event_host' AND e.organizer_id = auth.uid())
        OR p.role IN ('organizer', 'admin', 'super_admin')
      )
    )
    OR
    -- Invited guests can view through valid invitations
    EXISTS (
      SELECT 1 FROM event_attendees ea
      INNER JOIN invitations i ON i.id = ea.invitation_id
      WHERE ea.event_id = media.event_id
      AND ea.user_id = auth.uid()
      AND i.status = 'used'
      AND (i.expires_at IS NULL OR i.expires_at > NOW())
    )
  )
);

-- Create update/delete policy for staff and organizers
CREATE POLICY "Media management permissions" ON media
FOR ALL
USING (
  -- Event staff can manage
  EXISTS (
    SELECT 1 FROM event_staff es
    WHERE es.event_id = media.event_id
    AND es.user_id = auth.uid()
  )
  OR
  -- Event hosts and organizers can manage
  EXISTS (
    SELECT 1 FROM events e
    INNER JOIN profiles p ON p.id = auth.uid()
    WHERE e.id = media.event_id
    AND (
      (p.role = 'event_host' AND e.organizer_id = auth.uid())
      OR p.role IN ('organizer', 'admin', 'super_admin')
    )
  )
);

COMMIT; 