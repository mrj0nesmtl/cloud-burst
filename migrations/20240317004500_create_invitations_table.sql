-- Migration: Create invitations table for event attendee tracking
BEGIN;

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'used', 'expired', 'cancelled')),
    token TEXT UNIQUE NOT NULL,
    sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invitations_event_id ON public.invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- View policy: Event organizers and admins can view invitations
CREATE POLICY "View invitations for event organizers and admins" ON public.invitations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            INNER JOIN public.profiles p ON p.id = auth.uid()
            WHERE e.id = invitations.event_id
            AND (
                -- Allow event owners
                e.organizer_id = auth.uid()
                -- Allow admins and super_admins
                OR p.role IN ('super_admin', 'admin')
                -- Allow organizers of this event
                OR (p.role = 'organizer' AND e.organizer_id = p.id)
                -- Allow event hosts of this event
                OR (p.role = 'event_host' AND e.organizer_id = p.id)
            )
        )
    );

-- Insert policy: Event organizers and admins can create invitations
CREATE POLICY "Create invitations for event organizers and admins" ON public.invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events e
            INNER JOIN public.profiles p ON p.id = auth.uid()
            WHERE e.id = event_id
            AND (
                -- Allow event owners
                e.organizer_id = auth.uid()
                -- Allow admins and super_admins
                OR p.role IN ('super_admin', 'admin')
                -- Allow organizers of this event
                OR (p.role = 'organizer' AND e.organizer_id = p.id)
            )
        )
    );

-- Update policy: Event organizers and admins can update invitations
CREATE POLICY "Update invitations for event organizers and admins" ON public.invitations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            INNER JOIN public.profiles p ON p.id = auth.uid()
            WHERE e.id = event_id
            AND (
                -- Allow event owners
                e.organizer_id = auth.uid()
                -- Allow admins and super_admins
                OR p.role IN ('super_admin', 'admin')
                -- Allow organizers of this event
                OR (p.role = 'organizer' AND e.organizer_id = p.id)
            )
        )
    );

-- Delete policy: Only admins can delete invitations
CREATE POLICY "Delete invitations for admins" ON public.invitations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'admin')
        )
    );

-- Add helpful comments
COMMENT ON TABLE public.invitations IS 'Tracks event invitations and their status';
COMMENT ON COLUMN public.invitations.id IS 'Unique identifier for the invitation';
COMMENT ON COLUMN public.invitations.event_id IS 'Reference to the event this invitation is for';
COMMENT ON COLUMN public.invitations.email IS 'Email address of the invited attendee';
COMMENT ON COLUMN public.invitations.name IS 'Name of the invited attendee';
COMMENT ON COLUMN public.invitations.status IS 'Current status of the invitation (pending, sent, used, expired, cancelled)';
COMMENT ON COLUMN public.invitations.token IS 'Unique token for QR code generation and invitation verification';
COMMENT ON COLUMN public.invitations.sent_at IS 'When the invitation was sent';
COMMENT ON COLUMN public.invitations.expires_at IS 'When the invitation expires';
COMMENT ON COLUMN public.invitations.metadata IS 'Additional invitation metadata (e.g., custom message, role, etc.)';

-- Create function to handle invitation token generation
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.token IS NULL THEN
        NEW.token := encode(gen_random_bytes(32), 'hex');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic token generation
CREATE TRIGGER generate_invitation_token_trigger
    BEFORE INSERT ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_invitation_token();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic updated_at
CREATE TRIGGER handle_updated_at_trigger
    BEFORE UPDATE ON public.invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Verify the migration
DO $$
BEGIN
    -- Verify table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invitations'
    ) THEN
        RAISE EXCEPTION 'invitations table was not created successfully';
    END IF;

    -- Verify RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'invitations'
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on invitations table';
    END IF;
END $$;

COMMIT; 