-- Enable RLS on gallery_permissions table
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_permissions table
-- Policy for event owners to manage gallery permissions
CREATE POLICY "Event owners can manage gallery permissions" ON public.gallery_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = gallery_permissions.event_id
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
    -- User has access via guest record
    EXISTS (
      SELECT 1 FROM guests g
      WHERE g.id = gallery_permissions.guest_id
      AND g.email = auth.email()
    )
  );

-- Allow anonymous users to view gallery permissions with valid access tokens
CREATE POLICY "Anonymous users can view gallery permissions with token" ON public.gallery_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guests g
      WHERE g.id = gallery_permissions.guest_id
      AND g.access_token IS NOT NULL
    )
  );

-- Allow service roles full access
CREATE POLICY "Service roles have full access to gallery permissions" ON public.gallery_permissions
  USING (auth.role() = 'service_role');

-- Add a comment explaining these changes
COMMENT ON TABLE public.gallery_permissions IS 'Gallery access permissions with RLS enabled'; 