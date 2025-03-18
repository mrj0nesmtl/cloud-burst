-- Migration to document role capability patterns
COMMENT ON TABLE role_capabilities IS 'Defines capabilities for each role in the system';

-- Document role capability patterns
COMMENT ON COLUMN role_capabilities.role IS 'Role name: super_admin, admin, organizer, event_host, user, guest';
COMMENT ON COLUMN role_capabilities.capability IS 'Capability using format: action:resource[:scope]
Common patterns:
- manage:* (full management of resource)
- view:* (read-only access to resource)
- create:* (creation rights)
- update:* (update rights)
- delete:* (deletion rights)
- upload:* (upload rights)

Common resources:
- events (event management)
- photos (photo management)
- users (user management)
- analytics (analytics access)
- gallery (gallery management)
- roles (role management)

Common scopes:
- own_* (scoped to user''s own resources)
- all (full access)';

-- Create an index to improve capability lookups
CREATE INDEX IF NOT EXISTS idx_role_capabilities_capability 
ON role_capabilities (capability);

-- Document current role hierarchy and capabilities
COMMENT ON TABLE roles IS 'Role hierarchy from highest to lowest privileges:

1. super_admin
   - Has manage:all capability
   - Full system access
   - Can manage roles and users

2. admin
   - Broad management capabilities
   - Can manage events and users
   - Access to analytics

3. organizer
   - Event management capabilities
   - Can create, update, delete events
   - Can manage event photos and gallery
   - Can generate QR codes
   - Can manage attendees

4. event_host
   - Limited event management
   - Can create events
   - Can invite guests
   - Can view event analytics

5. user
   - Basic platform access
   - Can manage own profile
   - Can upload photos
   - Can view events

6. guest
   - Minimal access
   - Can view and upload event photos';

-- Verify role hierarchy is complete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM roles 
        WHERE name IN ('super_admin', 'admin', 'organizer', 'event_host', 'user', 'guest')
    ) THEN
        RAISE NOTICE 'Warning: Some standard roles are missing from the roles table';
    END IF;
END $$; 