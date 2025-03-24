-- Migration: Add invited_user capabilities and event_attendee relationships
BEGIN;

-- Update role description to be more specific about event-specific permissions
UPDATE public.roles
SET description = 'Invited attendee with QR code access - event-specific permissions and media upload capabilities'
WHERE name = 'invited_user';

-- Add core capabilities for invited users
INSERT INTO public.role_capabilities (role, capability)
VALUES 
    ('invited_user', 'manage:own_profile'),
    ('invited_user', 'view:events'),
    ('invited_user', 'view:event_photos'),
    ('invited_user', 'upload:event_photos'),
    ('invited_user', 'view:event_videos'),
    ('invited_user', 'upload:event_videos'),
    ('invited_user', 'manage:own_media')
ON CONFLICT (role, capability) DO NOTHING;

-- Add invitation_id to event_attendees if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_attendees' 
        AND column_name = 'invitation_id'
    ) THEN
        -- Add invitation_id column
        ALTER TABLE public.event_attendees 
        ADD COLUMN invitation_id UUID REFERENCES public.invitations(id);

        -- Add index for invitation lookups
        CREATE INDEX idx_event_attendees_invitation_id 
        ON public.event_attendees(invitation_id);

        -- Add comment explaining the column
        COMMENT ON COLUMN public.event_attendees.invitation_id IS 
        'References the invitation that was used to create this attendance record. NULL for walk-in guests or direct additions.';
    END IF;
END $$;

-- Update RLS policies for event_attendees to handle invited users
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow invited users to view their own attendance records
DROP POLICY IF EXISTS event_attendees_select_invited_policy ON public.event_attendees;
CREATE POLICY event_attendees_select_invited_policy ON public.event_attendees
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'organizer', 'event_host')
        )
    );

-- Add comment documenting the invited user role and capabilities
COMMENT ON TABLE public.roles IS 'User roles with associated capabilities and permissions.
Available roles:
- super_admin: Full system access (internal)
- admin: Administrative access (internal)
- organizer: Event management (paid tier)
- event_host: Event creation and management (free/paid)
- invited_user: Event-specific access via QR code
- user: Standard platform access
- guest: Public access only

The invited_user role is specifically designed for event attendees who receive 
QR code-based invitations. They can:
1. Access specific events they''re invited to
2. Upload and manage their own media
3. View event galleries
4. Manage their own profile';

-- Verify the migration
DO $$ 
BEGIN
    -- Verify invited_user role exists
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'invited_user') THEN
        RAISE EXCEPTION 'invited_user role is missing';
    END IF;

    -- Verify core capabilities are present
    IF NOT EXISTS (
        SELECT 1 FROM public.role_capabilities 
        WHERE role = 'invited_user' 
        AND capability IN (
            'manage:own_profile',
            'view:events',
            'view:event_photos',
            'upload:event_photos'
        )
    ) THEN
        RAISE EXCEPTION 'invited_user is missing core capabilities';
    END IF;

    -- Verify invitation_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_attendees' 
        AND column_name = 'invitation_id'
    ) THEN
        RAISE EXCEPTION 'invitation_id column was not created successfully';
    END IF;
END $$;

COMMIT; 