-- Drop the existing policy
DROP POLICY IF EXISTS "Event hosts can view event customization settings for their events" ON event_customization;

-- Create a new policy that uses user_id instead of host_id
CREATE POLICY "Event hosts can view event customization settings for their events"
  ON event_customization
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_customization.event_id
      AND events.user_id = auth.uid()
    )
  ); 