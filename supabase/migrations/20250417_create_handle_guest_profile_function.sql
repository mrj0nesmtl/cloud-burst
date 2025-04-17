-- Create a security definer function to handle guest profile creation/updates
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
  v_profile_id UUID;
BEGIN
  -- Get the event_id from the invitation
  SELECT event_id INTO v_event_id 
  FROM public.invitations 
  WHERE id = p_invitation_id;
  
  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation ID or invitation not found';
  END IF;

  -- Create or update a profile for this guest with proper subscription_status
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE email = p_email;

  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      subscription_status,  -- Set to 'free' to satisfy the constraint
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      p_email,
      p_name,
      'guest',
      'free',  -- Valid value that satisfies the constraint
      now(),
      now()
    );
  END IF;

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
COMMENT ON FUNCTION public.handle_guest_profile IS 'Creates or updates a guest profile with proper profile creation'; 