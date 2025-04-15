-- Add invitation_id column to guests table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'invitation_id'
  ) THEN
    -- First add the column allowing NULL values
    ALTER TABLE public.guests ADD COLUMN invitation_id UUID REFERENCES public.invitations(id);
    
    -- Create an index for better query performance
    CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON public.guests(invitation_id);
    
    -- Populate the column based on event_id and email match with invitations
    -- This assumes invitations have unique (email, event_id) pairs
    UPDATE public.guests g
    SET invitation_id = i.id
    FROM public.invitations i
    WHERE g.event_id = i.event_id AND g.email = i.email;
    
    -- Log a notice about migration
    RAISE NOTICE 'Added invitation_id column to guests table and populated from matching invitations';
  ELSE
    RAISE NOTICE 'invitation_id column already exists in guests table';
  END IF;
END
$$;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN public.guests.invitation_id IS 'Foreign key to invitations table, links guest profiles to invitations'; 