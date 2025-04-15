-- Create a view to safely access guest data for event organizers
CREATE OR REPLACE VIEW public.event_guests AS
SELECT 
  g.*,
  i.event_id,
  i.token as invitation_token,
  e.name as event_name,
  e.user_id as event_owner_id
FROM 
  public.guests g
JOIN 
  public.invitations i ON g.invitation_id = i.id
JOIN 
  public.events e ON i.event_id = e.id
WHERE 
  e.user_id = auth.uid();

-- Create a view for guests to see their own information
CREATE OR REPLACE VIEW public.my_guest_profile AS
SELECT 
  g.*,
  i.event_id,
  i.token as invitation_token,
  e.name as event_name
FROM 
  public.guests g
JOIN 
  public.invitations i ON g.invitation_id = i.id
JOIN 
  public.events e ON i.event_id = e.id
WHERE 
  i.email = auth.email();

-- Create a view for users to see their own gallery permissions
CREATE OR REPLACE VIEW public.my_gallery_permissions AS
SELECT 
  gp.*,
  g.name as gallery_name,
  g.event_id,
  e.name as event_name
FROM 
  public.gallery_permissions gp
JOIN 
  public.galleries g ON gp.gallery_id = g.id
JOIN 
  public.events e ON g.event_id = e.id
WHERE 
  gp.user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM invitations i
    WHERE i.id = gp.invitation_id
    AND i.email = auth.email()
  );

-- Add explanatory comments
COMMENT ON VIEW public.event_guests IS 'Secure view for event organizers to access guest data';
COMMENT ON VIEW public.my_guest_profile IS 'Secure view for guests to access their own profile data';
COMMENT ON VIEW public.my_gallery_permissions IS 'Secure view for users to access their own gallery permissions';

/* 
SECURITY VERIFICATION INSTRUCTIONS

After applying these migrations, verify the RLS setup works correctly:

1. Using the Supabase Dashboard:
   - Go to Authentication > Policies
   - Confirm guests and gallery_permissions tables have RLS enabled
   - Verify all policies are listed correctly

2. Testing as an event owner:
   - Try to access the event_guests view via API
   - Verify you can only see guests for your own events

3. Testing as a guest:
   - Try to access the my_guest_profile view
   - Verify you can only see your own guest profile

4. Testing anonymous access:
   - Try to directly access guests or gallery_permissions tables
   - Verify access is denied

IMPORTANT: These changes should fix the security errors shown in the Security Advisor.
Run a refresh in the Security Advisor after applying to confirm the errors are resolved.
*/ 