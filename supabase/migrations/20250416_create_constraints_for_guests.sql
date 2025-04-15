-- Add unique constraint on invitation_id if it doesn't exist
DO $$
BEGIN
  -- First check if constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'guests_invitation_id_key' 
    AND conrelid = 'public.guests'::regclass
  ) THEN
    -- Make sure there are no duplicates
    WITH duplicates AS (
      SELECT invitation_id, COUNT(*) 
      FROM public.guests 
      WHERE invitation_id IS NOT NULL 
      GROUP BY invitation_id 
      HAVING COUNT(*) > 1
    )
    DELETE FROM public.guests g
    WHERE g.id IN (
      SELECT g.id 
      FROM public.guests g
      JOIN duplicates d ON g.invitation_id = d.invitation_id
      ORDER BY g.updated_at DESC -- Keep only the most recently updated
      OFFSET 1 -- Skip the first one (most recent)
    );
    
    -- Add the unique constraint
    ALTER TABLE public.guests ADD CONSTRAINT guests_invitation_id_key UNIQUE (invitation_id);
    RAISE NOTICE 'Added unique constraint on invitation_id in guests table';
  ELSE
    RAISE NOTICE 'Unique constraint already exists on invitation_id in guests table';
  END IF;
  
  -- Make invitation_id NOT NULL if there are existing records with invitations
  IF EXISTS (
    SELECT 1 FROM public.guests WHERE invitation_id IS NOT NULL
  ) THEN
    -- First, ensure all guests have an invitation_id
    WITH guest_invitations AS (
      SELECT g.id, i.id AS invitation_id
      FROM public.guests g
      JOIN public.invitations i ON g.event_id = i.event_id AND g.email = i.email
      WHERE g.invitation_id IS NULL
    )
    UPDATE public.guests g
    SET invitation_id = gi.invitation_id
    FROM guest_invitations gi
    WHERE g.id = gi.id;
    
    -- Add NOT NULL constraint
    IF EXISTS (
      SELECT 1 FROM public.guests WHERE invitation_id IS NULL
    ) THEN
      RAISE NOTICE 'Some guests still have NULL invitation_id, cannot add NOT NULL constraint';
    ELSE
      ALTER TABLE public.guests ALTER COLUMN invitation_id SET NOT NULL;
      RAISE NOTICE 'Set invitation_id to NOT NULL in guests table';
    END IF;
  END IF;
END
$$;

-- Add a comment explaining the constraints
COMMENT ON CONSTRAINT guests_invitation_id_key ON public.guests IS 'Ensures each invitation can have only one guest profile';

-- Create a unique index on (event_id, email) if it doesn't exist (for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_guests_event_email'
  ) THEN
    CREATE UNIQUE INDEX idx_guests_event_email ON public.guests(event_id, email);
    RAISE NOTICE 'Created unique index on (event_id, email) in guests table';
  ELSE
    RAISE NOTICE 'Unique index on (event_id, email) already exists in guests table';
  END IF;
END
$$; 