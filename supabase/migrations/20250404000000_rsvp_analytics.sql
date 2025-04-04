-- Create analytics events table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events (type);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS analytics_events_invitation_id_idx ON analytics_events (invitation_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events (created_at);

-- Create a view for RSVP analytics
CREATE OR REPLACE VIEW rsvp_analytics AS
SELECT 
  ae.id,
  ae.created_at,
  i.id as invitation_id,
  i.event_id,
  i.email,
  i.name,
  (ae.properties->>'status')::text as status,
  (ae.properties->>'timestamp')::timestamptz as response_timestamp,
  (ae.properties->>'source')::text as source,
  COALESCE((ae.properties->>'guestCount')::int, 1) as guest_count,
  COALESCE((ae.properties->>'hasPlusOne')::boolean, false) as has_plus_one,
  COALESCE((ae.properties->>'hasDietaryRestrictions')::boolean, false) as has_dietary_restrictions,
  COALESCE((ae.properties->>'hasNotes')::boolean, false) as has_notes,
  e.name as event_name,
  e.date as event_date,
  p.full_name as organizer_name
FROM 
  analytics_events ae
JOIN 
  invitations i ON ae.invitation_id = i.id
JOIN 
  events e ON i.event_id = e.id
LEFT JOIN 
  profiles p ON e.organizer_id = p.id
WHERE 
  ae.type = 'rsvp_response';

-- Set up row level security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy for organizers to see analytics for their events
CREATE POLICY "Organizers can view analytics for their events" 
ON analytics_events 
FOR SELECT 
USING (
  invitation_id IN (
    SELECT i.id FROM invitations i
    JOIN events e ON i.event_id = e.id
    WHERE e.organizer_id = auth.uid()
  )
);

-- Policy for admins to see all analytics
CREATE POLICY "Admins can view all analytics" 
ON analytics_events 
FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Policy for inserting analytics events (allow all authenticated users)
CREATE POLICY "Users can insert their own analytics events" 
ON analytics_events 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) OR 
  (auth.jwt() ->> 'invitation_token' IS NOT NULL)
); 