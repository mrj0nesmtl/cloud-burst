-- First, ensure invitation_id column exists on guests table
-- This ensures the migration can be run in the correct order
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'invitation_id'
  ) THEN
    RAISE EXCEPTION 'The invitation_id column must be added to the guests table before enabling RLS policies. Run the 20250416_add_invitation_id_to_guests.sql migration first.';
  END IF;
END
$$;

-- Enable RLS on guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gallery_permissions table
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

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

-- Create policies for gallery_permissions table
-- Policy for event owners to manage gallery permissions
CREATE POLICY "Event owners can manage gallery permissions" ON public.gallery_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN galleries g ON e.id = g.event_id
      WHERE g.id = gallery_permissions.gallery_id
      AND e.user_id = auth.uid()
    )
  );

-- Policy for users to view their own permissions
CREATE POLICY "Users can view their own gallery permissions" ON public.gallery_permissions
  FOR SELECT
  USING (
    -- User is directly granted permission
    (user_id = auth.uid())
    OR
    -- User has access via invitation
    EXISTS (
      SELECT 1 FROM invitations i
      WHERE i.id = invitation_id
      AND i.email = auth.email()
    )
  );

-- Allow anonymous users to view gallery permissions with valid access tokens
CREATE POLICY "Anonymous users can view gallery permissions with token" ON public.gallery_permissions
  FOR SELECT
  USING (
    access_token IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM galleries g
      WHERE g.id = gallery_permissions.gallery_id
      AND g.is_public = true
    )
  );

-- Allow service roles full access
CREATE POLICY "Service roles have full access to gallery permissions" ON public.gallery_permissions
  USING (auth.role() = 'service_role');

-- Add a comment explaining these changes
COMMENT ON TABLE public.guests IS 'Guest profiles for events with RLS enabled';
COMMENT ON TABLE public.gallery_permissions IS 'Gallery access permissions with RLS enabled'; 