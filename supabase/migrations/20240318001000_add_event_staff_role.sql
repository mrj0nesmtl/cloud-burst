-- Migration: Add event_staff role and capabilities
BEGIN;

-- Add new role
INSERT INTO roles (name, description)
VALUES ('event_staff', 'Event photographer or staff member with event-specific upload and management permissions');

-- Add capabilities for event_staff role
INSERT INTO role_capabilities (role, capability) VALUES
  ('event_staff', 'manage:own_profile'),
  ('event_staff', 'upload:event_photos'),
  ('event_staff', 'view:event_photos'),
  ('event_staff', 'manage:photos'),
  ('event_staff', 'view:event_analytics'),
  ('event_staff', 'invite:guests');

-- Create event_staff table to track staff assignments
CREATE TABLE IF NOT EXISTS event_staff (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL DEFAULT 'photographer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(event_id, user_id)
);

-- Add RLS policies for event_staff table
ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;

-- Event hosts and organizers can manage staff for their events
CREATE POLICY "Event hosts can manage their event staff"
ON event_staff
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e
    INNER JOIN profiles p ON p.id = auth.uid()
    WHERE e.id = event_staff.event_id
    AND (
      (p.role = 'event_host' AND e.organizer_id = auth.uid())
      OR p.role IN ('organizer', 'admin', 'super_admin')
    )
  )
);

-- Staff members can view their own assignments
CREATE POLICY "Staff can view their own assignments"
ON event_staff
FOR SELECT
USING (user_id = auth.uid());

-- Update the invitation check to include event staff
CREATE OR REPLACE FUNCTION public.check_invitation_eligibility(
  p_event_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles p
    LEFT JOIN event_staff es ON es.user_id = p.id AND es.event_id = p_event_id
    LEFT JOIN events e ON e.id = p_event_id
    WHERE p.id = p_user_id
    AND (
      p.role IN ('admin', 'super_admin', 'organizer')
      OR (p.role = 'event_host' AND e.organizer_id = p_user_id)
      OR es.id IS NOT NULL  -- Check if user is event staff
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT; 