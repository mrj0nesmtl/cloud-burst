-- Migration to standardize role capabilities and remove duplicates
BEGIN;

-- First, remove duplicates before updating to avoid constraint violations
DELETE FROM role_capabilities a
WHERE EXISTS (
    SELECT 1
    FROM role_capabilities b
    WHERE a.role = b.role
    AND a.capability = b.capability
    AND a.created_at > b.created_at
);

-- Create mapping table
WITH capability_mapping AS (
    VALUES
        -- Admin capabilities
        ('manage_events', 'manage:events'),
        ('manage_photos', 'manage:photos'),
        ('view_analytics', 'view:analytics'),
        
        -- Organizer capabilities
        ('create_event', 'create:events'),
        ('edit_own_event', 'manage:own_events'),
        ('manage_event_photos', 'manage:photos'),
        ('view_event_analytics', 'view:event_analytics'),
        
        -- Super admin capabilities
        ('manage_roles', 'manage:roles'),
        ('manage_users', 'manage:users'),
        
        -- User capabilities
        ('manage_own_photos', 'manage:own_photos'),
        ('upload_photos', 'upload:photos'),
        ('view_public_events', 'view:events')
)
-- Delete old capabilities that have a new version already present
DELETE FROM role_capabilities rc
WHERE EXISTS (
    SELECT 1
    FROM capability_mapping cm
    WHERE rc.capability = cm.column1
    AND EXISTS (
        SELECT 1
        FROM role_capabilities rc2
        WHERE rc2.role = rc.role
        AND rc2.capability = cm.column2
    )
);

-- Now update remaining capabilities
WITH capability_mapping AS (
    VALUES
        -- Admin capabilities
        ('manage_events', 'manage:events'),
        ('manage_photos', 'manage:photos'),
        ('view_analytics', 'view:analytics'),
        
        -- Organizer capabilities
        ('create_event', 'create:events'),
        ('edit_own_event', 'manage:own_events'),
        ('manage_event_photos', 'manage:photos'),
        ('view_event_analytics', 'view:event_analytics'),
        
        -- Super admin capabilities
        ('manage_roles', 'manage:roles'),
        ('manage_users', 'manage:users'),
        
        -- User capabilities
        ('manage_own_photos', 'manage:own_photos'),
        ('upload_photos', 'upload:photos'),
        ('view_public_events', 'view:events')
),
updated_capabilities AS (
    UPDATE role_capabilities rc
    SET capability = cm.column2
    FROM capability_mapping cm
    WHERE rc.capability = cm.column1
    RETURNING rc.*
)
SELECT count(*) as capabilities_updated FROM updated_capabilities;

-- Show current state of capabilities
SELECT role, capability, created_at 
FROM role_capabilities 
ORDER BY role, capability;

COMMIT; 