-- Add guests table for non-RSVP event attendees
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  access_token UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(email, event_id)
);

-- Add gallery permissions table
CREATE TABLE IF NOT EXISTS public.gallery_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view',
  can_upload BOOLEAN NOT NULL DEFAULT false,
  can_download BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
  )
);

-- Add is_gallery_public column to events if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'is_gallery_public'
  ) THEN
    ALTER TABLE public.events 
    ADD COLUMN is_gallery_public BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_access_token ON public.guests(access_token);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_event_id ON public.gallery_permissions(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_user_id ON public.gallery_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_guest_id ON public.gallery_permissions(guest_id);

-- Add RLS policies for guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view their own records"
  ON public.guests
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    ) OR 
    auth.jwt() -> 'email' ->> 'email' = email
  );

CREATE POLICY "Event owners and admins can insert guests"
  ON public.guests
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    )
  );

CREATE POLICY "Event owners and admins can update guests"
  ON public.guests
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    )
  );

CREATE POLICY "Event owners and admins can delete guests"
  ON public.guests
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    )
  );

-- Add RLS policies for gallery_permissions table
ALTER TABLE public.gallery_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery permissions are viewable by event owners, admins, and permitted users"
  ON public.gallery_permissions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    ) OR 
    auth.uid() = user_id OR
    auth.jwt() -> 'email' ->> 'email' IN (
      SELECT email FROM public.guests WHERE id = guest_id
    )
  );

CREATE POLICY "Event owners and admins can insert gallery permissions"
  ON public.gallery_permissions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    )
  );

CREATE POLICY "Event owners and admins can update gallery permissions"
  ON public.gallery_permissions
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    )
  );

CREATE POLICY "Event owners and admins can delete gallery permissions"
  ON public.gallery_permissions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.events_users WHERE event_id = event_id AND (role = 'owner' OR role = 'admin')
    )
  );

-- Create a function for tracking guest registrations (analytics)
CREATE OR REPLACE FUNCTION public.track_guest_registration(
  p_event_id UUID,
  p_guest_email TEXT,
  p_referrer TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.analytics (
    event_type,
    event_data,
    created_at
  ) VALUES (
    'guest_registration',
    jsonb_build_object(
      'event_id', p_event_id,
      'guest_email', p_guest_email,
      'referrer', p_referrer,
      'timestamp', now()
    ),
    now()
  );
END;
$$; 