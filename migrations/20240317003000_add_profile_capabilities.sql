-- Migration to add profile management capabilities to authenticated roles
BEGIN;

-- Add manage:own_profile capability to all authenticated roles if they don't have it
INSERT INTO role_capabilities (role, capability, created_at)
SELECT r.name, 'manage:own_profile', NOW()
FROM roles r
WHERE r.name IN ('super_admin', 'admin', 'organizer', 'event_host')
AND NOT EXISTS (
    SELECT 1 
    FROM role_capabilities rc 
    WHERE rc.role = r.name 
    AND rc.capability = 'manage:own_profile'
);

-- Update the roles documentation to reflect this change
COMMENT ON TABLE roles IS 'Role hierarchy from highest to lowest privileges:

1. super_admin
   - Has manage:all capability
   - Full system access
   - Can manage roles and users
   - Can manage own profile

2. admin
   - Broad management capabilities
   - Can manage events and users
   - Access to analytics
   - Can manage own profile

3. organizer
   - Event management capabilities
   - Can create, update, delete events
   - Can manage event photos and gallery
   - Can generate QR codes
   - Can manage attendees
   - Can manage own profile

4. event_host
   - Limited event management
   - Can create events
   - Can invite guests
   - Can view event analytics
   - Can manage own profile

5. user
   - Basic platform access
   - Can manage own profile
   - Can upload photos
   - Can view events

6. guest
   - Minimal access
   - Can view and upload event photos';

-- Show the updated capabilities
SELECT role, capability, created_at 
FROM role_capabilities 
WHERE capability = 'manage:own_profile'
ORDER BY role;

COMMIT; 