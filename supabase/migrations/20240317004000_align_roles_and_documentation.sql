-- Migration to align roles and their descriptions
BEGIN;

-- Update existing role descriptions to match documentation
UPDATE roles
SET description = CASE name
    WHEN 'super_admin' THEN 'Full system access with all capabilities - internal use only'
    WHEN 'admin' THEN 'Administrative access for platform management - internal use only'
    WHEN 'organizer' THEN 'Event management access - paid tier only, can create and manage multiple events'
    WHEN 'event_host' THEN 'Can create and manage their own events (cannot delete events)'
    WHEN 'user' THEN 'Standard user with basic platform access'
    WHEN 'guest' THEN 'Public access - can view public events and upload event photos'
END
WHERE name IN ('super_admin', 'admin', 'organizer', 'event_host', 'user', 'guest');

-- Add invited_user role if it doesn't exist
INSERT INTO roles (name, description, created_at)
SELECT 
    'invited_user',
    'Invited attendee with QR code access - event-specific permissions',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'invited_user'
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

-- Update roles documentation
COMMENT ON TABLE roles IS 'Role hierarchy from highest to lowest privileges:

1. super_admin (internal)
   - Full system access with all capabilities
   - User management and role assignment
   - System configuration and templates
   - Can manage all profiles

2. admin (internal)
   - Platform management capabilities
   - User and event management
   - Analytics access
   - Cannot assign roles

3. organizer (paid tier)
   - Create and manage multiple events
   - Full event customization
   - Gallery and QR code management
   - Attendee management
   - Event analytics

4. event_host (free/paid)
   - Create and manage own events
   - Cannot delete events
   - Basic event customization
   - Attendee management
   - Limited analytics

5. invited_user (free)
   - QR code-based event access
   - Event-specific permissions
   - Photo upload for assigned events
   - Own profile management

6. user (free)
   - Basic platform access
   - Photo upload capabilities
   - Profile management
   - Public event access

7. guest (no account)
   - View public events
   - Upload event photos
   - No profile management
   - Limited platform interaction';

-- Show current roles and their descriptions
SELECT 
    name,
    description,
    created_at,
    CASE 
        WHEN name IN ('super_admin', 'admin') THEN 'internal'
        WHEN name = 'organizer' THEN 'paid'
        WHEN name = 'event_host' THEN 'free/paid'
        ELSE 'free'
    END as tier
FROM roles
ORDER BY 
    CASE name
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'organizer' THEN 3
        WHEN 'event_host' THEN 4
        WHEN 'invited_user' THEN 5
        WHEN 'user' THEN 6
        WHEN 'guest' THEN 7
    END;

COMMIT; 