-- Migration to update role documentation and add invited_user capabilities
BEGIN;

-- Add invited_user role if it doesn't exist
INSERT INTO roles (name, description)
SELECT 'invited_user', 'Invited attendee with QR code access'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'invited_user'
);

-- Add manage:own_profile capability to invited_user
INSERT INTO role_capabilities (role, capability, created_at)
SELECT 'invited_user', 'manage:own_profile', NOW()
WHERE NOT EXISTS (
    SELECT 1 
    FROM role_capabilities 
    WHERE role = 'invited_user' 
    AND capability = 'manage:own_profile'
);

-- Update role capabilities documentation
COMMENT ON TABLE role_capabilities IS 'Defines the capabilities for each role in the system.
Standard capability format: {action}:{resource}[:scope]

Actions:
- manage: Full management capabilities
- view: Read-only access
- create: Creation rights
- update: Update rights
- delete: Deletion rights
- upload: Upload rights

Resources:
- events: Event management
- photos: Photo management
- users: User management
- analytics: Analytics access
- gallery: Gallery management
- roles: Role management
- own_profile: Profile management

Scopes:
- own: Limited to user''s own resources
- all: Full access to all resources';

-- Update roles documentation with explicit profile management
COMMENT ON TABLE roles IS 'Role hierarchy from highest to lowest privileges:

1. super_admin
   - Has manage:all capability
   - Full system access
   - Can manage roles and users
   - Can manage own profile
   - Can manage all profiles

2. admin
   - Broad management capabilities
   - Can manage events and users
   - Access to analytics
   - Can manage own profile
   - Can manage user profiles

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

5. invited_user
   - Event-specific access via QR code
   - Can view assigned events
   - Can upload event photos
   - Can manage own profile

6. user
   - Basic platform access
   - Can manage own profile
   - Can upload photos
   - Can view events

7. guest
   - Minimal access
   - Can view and upload event photos
   - No profile management';

-- Show current state of profile management capabilities
SELECT r.name as role, r.description, 
       CASE WHEN rc.capability IS NOT NULL THEN true ELSE false END as has_profile_management,
       rc.created_at as capability_added
FROM roles r
LEFT JOIN role_capabilities rc ON r.name = rc.role AND rc.capability = 'manage:own_profile'
ORDER BY 
  CASE r.name 
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'organizer' THEN 3
    WHEN 'event_host' THEN 4
    WHEN 'invited_user' THEN 5
    WHEN 'user' THEN 6
    WHEN 'guest' THEN 7
  END;

COMMIT; 