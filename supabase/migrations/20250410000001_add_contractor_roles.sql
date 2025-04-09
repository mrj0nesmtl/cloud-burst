-- migrations/20250410000001_add_contractor_roles.sql

-- Create role_enum type directly and handle errors
DO $$
BEGIN
    -- Try to create the enum type
    BEGIN
        CREATE TYPE public.role_enum AS ENUM (
            'super_admin',
            'admin',
            'organizer', 
            'event_host',
            'event_staff',
            'user',
            'guest',
            'contractor',
            'photographer',
            'technician',
            'marketing'
        );
    EXCEPTION
        -- Catch the error if type already exists
        WHEN duplicate_object THEN
            -- Add new values separately - use simple ADD VALUE
            BEGIN
                ALTER TYPE public.role_enum ADD VALUE 'contractor';
            EXCEPTION WHEN duplicate_object THEN
                -- Value might already exist, ignore error
                NULL;
            END;
            
            BEGIN
                ALTER TYPE public.role_enum ADD VALUE 'photographer';
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END;
            
            BEGIN
                ALTER TYPE public.role_enum ADD VALUE 'technician';
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END;
            
            BEGIN
                ALTER TYPE public.role_enum ADD VALUE 'marketing';
            EXCEPTION WHEN duplicate_object THEN
                NULL;
            END;
    END;
END
$$;

-- Use role as TEXT rather than an enum for the staff_type column to avoid enum issues
ALTER TABLE public.event_staff ADD COLUMN IF NOT EXISTS staff_type TEXT DEFAULT 'internal';
ALTER TABLE public.event_staff ADD CONSTRAINT check_staff_type CHECK (staff_type IN ('internal', 'external'));

-- Add detailed role information
ALTER TABLE public.event_staff ADD COLUMN IF NOT EXISTS role_details JSONB DEFAULT '{}'::jsonb;

-- Add a column for staff roles in case the enum still causes issues
ALTER TABLE public.event_staff ADD COLUMN IF NOT EXISTS staff_role TEXT DEFAULT 'event_staff';

-- Add status column if needed
ALTER TABLE public.event_staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update RLS policies for contractors
DROP POLICY IF EXISTS "Contractors can view their assigned events" ON public.events;
CREATE POLICY "Contractors can view their assigned events"
ON public.events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_staff 
    WHERE event_id = public.events.id
    AND (user_id = auth.uid() OR user_id::text = auth.uid()::text)
    AND staff_type = 'external'
  )
);

-- Gallery permissions for photographers
DROP POLICY IF EXISTS "Photographers can upload to gallery" ON storage.objects;
CREATE POLICY "Photographers can upload to gallery"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM public.event_staff es
    JOIN public.events e ON e.id = es.event_id
    WHERE (es.user_id = auth.uid() OR es.user_id::text = auth.uid()::text)
    AND es.staff_type = 'external'
    AND (es.staff_role = 'photographer' OR es.role = 'photographer')
    AND storage.foldername(name) = e.id
  )
);
