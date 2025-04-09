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
CREATE INDEX IF NOT EXISTS idx_guests_event_id_status ON public.guests(event_id, status);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_event_id ON public.gallery_permissions(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_user_id ON public.gallery_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_permissions_guest_id ON public.gallery_permissions(guest_id);

-- Add RLS policies for guests table
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Other RLS policies as in your original SQL...