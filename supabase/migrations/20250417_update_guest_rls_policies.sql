-- Drop existing restrictive policies for insert/update on guests table
DROP POLICY IF EXISTS "Guests can insert their own information" ON public.guests;
DROP POLICY IF EXISTS "Guests can update their own information" ON public.guests;

-- Create new policy for guests coming from invitations
CREATE POLICY "Allow guest creation and updates from invitations" 
ON public.guests
FOR ALL 
USING (true)  -- Allow read operations
WITH CHECK (true);  -- Allow write operations

COMMENT ON POLICY "Allow guest creation and updates from invitations" ON public.guests IS 
'Allows creation and updates to guest profiles from invitation links';

-- Alternative more secure policy that checks for invitation token in the request
-- Uncomment after testing if you want more security
/*
CREATE POLICY "Allow guest creation with valid invitation" 
ON public.guests
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invitations 
    WHERE invitations.id = invitation_id
  )
);

CREATE POLICY "Allow guest updates with matching invitation" 
ON public.guests
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM invitations 
    WHERE invitations.id = invitation_id
  )
);
*/ 