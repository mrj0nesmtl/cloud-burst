-- Create a guest-specific profile function that bypasses the user-profile foreign key constraint
CREATE OR REPLACE FUNCTION public.handle_guest_profile(
  p_invitation_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS SETOF public.guests
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_access_token UUID := gen_random_uuid();
BEGIN
  -- Get the event_id from the invitation
  SELECT event_id INTO v_event_id 
  FROM public.invitations 
  WHERE id = p_invitation_id;
  
  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation ID or invitation not found';
  END IF;

  -- Skip creating a profile entry - we'll just work with the guests table
  -- since it doesn't have the foreign key constraint to users

  -- Create or update the guest record
  RETURN QUERY
  INSERT INTO public.guests (
    invitation_id,
    event_id,
    name,
    email,
    phone,
    notes,
    avatar_url,
    access_token,
    status,
    updated_at
  )
  VALUES (
    p_invitation_id,
    v_event_id,
    p_name,
    p_email,
    p_phone,
    p_notes,
    p_avatar_url,
    v_access_token,
    'registered',
    now()
  )
  ON CONFLICT (invitation_id) DO UPDATE
  SET
    name = p_name,
    email = p_email,
    phone = p_phone,
    notes = p_notes,
    avatar_url = CASE WHEN p_avatar_url IS NULL THEN guests.avatar_url ELSE p_avatar_url END,
    updated_at = now()
  RETURNING *;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.handle_guest_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_guest_profile TO service_role;

-- Add comment to explain function purpose
COMMENT ON FUNCTION public.handle_guest_profile IS 'Creates or updates a guest record without requiring a profile'; 