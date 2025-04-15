-- Enable RLS on guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies for guests table
-- Policy for event hosts/organizers to access guest information for their events
CREATE POLICY "Event hosts can view their event guests" ON public.guests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invitations i
      JOIN events e ON i.event_id = e.id
      WHERE i.id = guests.invitation_id
      AND e.user_id = auth.uid()
    )
  );

-- Policy for guests to view and update their own information
CREATE POLICY "Guests can view their own information" ON public.guests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.id = guests.invitation_id
      AND i.email = auth.email()
    )
  );

CREATE POLICY "Guests can update their own information" ON public.guests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.id = guests.invitation_id
      AND i.email = auth.email()
    )
  );

-- Policy for guests to insert their own information
CREATE POLICY "Guests can insert their own information" ON public.guests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.id = invitation_id
      AND i.email = auth.email()
    )
  );

-- Policy to allow access via event_id as a fallback
CREATE POLICY "Allow access via event_id fallback" ON public.guests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = guests.event_id
      AND e.user_id = auth.uid()
    )
  );

-- Allow service roles full access
CREATE POLICY "Service roles have full access to guests" ON public.guests
  USING (auth.role() = 'service_role');

-- Add a comment explaining these changes
COMMENT ON TABLE public.guests IS 'Guest profiles for events with RLS enabled'; 