-- Migration: Create RSVP table for tracking invitation responses
BEGIN;

-- Create RSVP table
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  guest_count INTEGER NOT NULL DEFAULT 1,
  dietary_restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT fk_invitation FOREIGN KEY (invitation_id) REFERENCES public.invitations(id) ON DELETE CASCADE
);

-- Add index for invitation lookups
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON public.rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON public.rsvps(status);

-- Enable RLS
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Only allow event owners and admins to see all RSVPs
CREATE POLICY "View RSVPs for event organizers and admins" ON public.rsvps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      JOIN public.events e ON e.id = i.event_id
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = rsvps.invitation_id
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

-- Allow insert/update via token for public routes
CREATE POLICY "Submit RSVP with valid invitation token" ON public.rsvps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invitation_id IN (
      SELECT id FROM public.invitations
      WHERE status IN ('sent', 'used')
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Allow users to update their own RSVPs
CREATE POLICY "Update own RSVP" ON public.rsvps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = rsvps.invitation_id
      AND i.email = (
        SELECT email FROM public.profiles
        WHERE id = auth.uid()
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_rsvp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic updated_at
CREATE TRIGGER handle_rsvp_updated_at_trigger
    BEFORE UPDATE ON public.rsvps
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_rsvp_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.rsvps IS 'Tracks RSVP responses to invitations';
COMMENT ON COLUMN public.rsvps.id IS 'Unique identifier for the RSVP';
COMMENT ON COLUMN public.rsvps.invitation_id IS 'Reference to the invitation this RSVP is for';
COMMENT ON COLUMN public.rsvps.status IS 'Current status of the RSVP (pending, accepted, declined)';
COMMENT ON COLUMN public.rsvps.guest_count IS 'Number of guests including the invitee';
COMMENT ON COLUMN public.rsvps.dietary_restrictions IS 'Any dietary restrictions or preferences';
COMMENT ON COLUMN public.rsvps.notes IS 'Additional notes or messages from the guest';

-- Verify the migration
DO $$
BEGIN
    -- Verify table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rsvps'
    ) THEN
        RAISE EXCEPTION 'rsvps table was not created successfully';
    END IF;

    -- Verify RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'rsvps'
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on rsvps table';
    END IF;
END $$;

COMMIT; 