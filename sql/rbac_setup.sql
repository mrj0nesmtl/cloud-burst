-- Role-Based Access Control Setup for Cloud Burst
-- Version: 1.0.0
-- Date: 2023-03-03

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  name TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role capabilities table
CREATE TABLE IF NOT EXISTS public.role_capabilities (
  role TEXT REFERENCES public.roles(name) ON DELETE CASCADE,
  capability TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role, capability)
);

-- Update profiles table to include role and subscription information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Add foreign key constraint to profiles table
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_fkey
FOREIGN KEY (role) REFERENCES public.roles(name);

-- Add check constraint for allowed roles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role = ANY (ARRAY['super_admin', 'admin', 'organizer', 'event_host', 'user', 'guest']));

-- Add check constraint for subscription tiers
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier = ANY (ARRAY['free', 'pro', 'enterprise']));

-- Add check constraint for subscription status
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_status_check
CHECK (subscription_status = ANY (ARRAY['active', 'inactive', 'trial', 'expired']));

-- Insert default roles
INSERT INTO public.roles (name, description)
VALUES 
  ('super_admin', 'Full system access - internal use only'),
  ('admin', 'Administrative access - internal use only'),
  ('organizer', 'Event management access - can create and manage multiple events'),
  ('event_host', 'Can create and manage their own events - cannot delete events'),
  ('user', 'Standard user with basic platform access'),
  ('guest', 'Public access - can view public events and galleries')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Insert role capabilities for super_admin
INSERT INTO public.role_capabilities (role, capability)
VALUES
  ('super_admin', 'manage:all'),
  ('super_admin', 'create:events'),
  ('super_admin', 'read:events'),
  ('super_admin', 'update:events'),
  ('super_admin', 'delete:events'),
  ('super_admin', 'create:users'),
  ('super_admin', 'read:users'),
  ('super_admin', 'update:users'),
  ('super_admin', 'delete:users'),
  ('super_admin', 'assign:roles'),
  ('super_admin', 'access:admin'),
  ('super_admin', 'access:analytics')
ON CONFLICT (role, capability) DO NOTHING;

-- Insert role capabilities for admin
INSERT INTO public.role_capabilities (role, capability)
VALUES
  ('admin', 'create:events'),
  ('admin', 'read:events'),
  ('admin', 'update:events'),
  ('admin', 'delete:events'),
  ('admin', 'create:users'),
  ('admin', 'read:users'),
  ('admin', 'update:users'),
  ('admin', 'access:admin'),
  ('admin', 'access:analytics')
ON CONFLICT (role, capability) DO NOTHING;

-- Insert role capabilities for organizer
INSERT INTO public.role_capabilities (role, capability)
VALUES
  ('organizer', 'create:events'),
  ('organizer', 'read:events'),
  ('organizer', 'update:own_events'),
  ('organizer', 'delete:own_events'),
  ('organizer', 'create:attendees'),
  ('organizer', 'read:attendees'),
  ('organizer', 'update:attendees'),
  ('organizer', 'delete:attendees'),
  ('organizer', 'create:photos'),
  ('organizer', 'read:photos'),
  ('organizer', 'update:own_photos'),
  ('organizer', 'delete:own_photos'),
  ('organizer', 'access:analytics')
ON CONFLICT (role, capability) DO NOTHING;

-- Insert role capabilities for event_host
INSERT INTO public.role_capabilities (role, capability)
VALUES
  ('event_host', 'create:events'),
  ('event_host', 'read:events'),
  ('event_host', 'update:own_events'),
  ('event_host', 'create:attendees'),
  ('event_host', 'read:attendees'),
  ('event_host', 'update:attendees'),
  ('event_host', 'delete:attendees'),
  ('event_host', 'create:photos'),
  ('event_host', 'read:photos'),
  ('event_host', 'update:own_photos'),
  ('event_host', 'delete:own_photos')
ON CONFLICT (role, capability) DO NOTHING;

-- Insert role capabilities for user
INSERT INTO public.role_capabilities (role, capability)
VALUES
  ('user', 'read:events'),
  ('user', 'read:photos'),
  ('user', 'create:photos'),
  ('user', 'update:own_photos'),
  ('user', 'delete:own_photos')
ON CONFLICT (role, capability) DO NOTHING;

-- Insert role capabilities for guest
INSERT INTO public.role_capabilities (role, capability)
VALUES
  ('guest', 'read:events'),
  ('guest', 'read:photos')
ON CONFLICT (role, capability) DO NOTHING;

-- Create RLS policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view public events
DROP POLICY IF EXISTS events_view_public ON public.events;
CREATE POLICY events_view_public ON public.events
  FOR SELECT
  USING (is_public = true);

-- Policy: Users can view events they are invited to
DROP POLICY IF EXISTS events_view_invited ON public.events;
CREATE POLICY events_view_invited ON public.events
  FOR SELECT
  USING (
    id IN (
      SELECT event_id FROM public.event_attendees
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Organizers and event hosts can view their own events
DROP POLICY IF EXISTS events_view_own ON public.events;
CREATE POLICY events_view_own ON public.events
  FOR SELECT
  USING (organizer_id = auth.uid());

-- Policy: Super admins and admins can view all events
DROP POLICY IF EXISTS events_view_admin ON public.events;
CREATE POLICY events_view_admin ON public.events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Policy: Organizers and event hosts can create events
DROP POLICY IF EXISTS events_insert ON public.events;
CREATE POLICY events_insert ON public.events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'organizer', 'event_host')
    )
  );

-- Policy: Organizers and event hosts can update their own events
DROP POLICY IF EXISTS events_update_own ON public.events;
CREATE POLICY events_update_own ON public.events
  FOR UPDATE
  USING (organizer_id = auth.uid());

-- Policy: Super admins and admins can update any event
DROP POLICY IF EXISTS events_update_admin ON public.events;
CREATE POLICY events_update_admin ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Policy: Organizers can delete their own events
DROP POLICY IF EXISTS events_delete_own ON public.events;
CREATE POLICY events_delete_own ON public.events
  FOR DELETE
  USING (
    organizer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'organizer')
    )
  );

-- Policy: Super admins and admins can delete any event
DROP POLICY IF EXISTS events_delete_admin ON public.events;
CREATE POLICY events_delete_admin ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Create function to check if user has a specific capability
CREATE OR REPLACE FUNCTION public.has_capability(capability TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the user's role
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Check if the user has the capability
  RETURN EXISTS (
    SELECT 1 FROM public.role_capabilities
    WHERE role = user_role AND (
      capability = $1 OR capability = 'manage:all'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 