-- Create a security definer function to allow server-side operations on guests table
CREATE OR REPLACE FUNCTION public.handle_guest_profile(
  p_invitation_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_notes TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,  -- Optional event_id
  p_access_token UUID DEFAULT NULL, -- Optional access_token
  p_status TEXT DEFAULT 'registered' -- Optional status
) RETURNS SETOF public.guests
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_access_token UUID;
BEGIN
  -- Get the event_id from the invitation if not provided
  IF p_event_id IS NULL THEN
    SELECT event_id INTO v_event_id 
    FROM public.invitations 
    WHERE id = p_invitation_id;
    
    IF v_event_id IS NULL THEN
      RAISE EXCEPTION 'Invalid invitation ID or invitation not found';
    END IF;
  ELSE
    v_event_id := p_event_id;
  END IF;
  
  -- Generate access token if not provided
  IF p_access_token IS NULL THEN
    v_access_token := gen_random_uuid();
  ELSE
    v_access_token := p_access_token;
  END IF;

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
    p_status,
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

-- Create a function to safely get guest information by token
CREATE OR REPLACE FUNCTION public.get_guest_by_token(
  p_token TEXT
) RETURNS SETOF public.guests
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT g.* FROM public.guests g
  JOIN public.invitations i ON g.invitation_id = i.id
  WHERE i.token = p_token;
END;
$$;

-- Add security comments to the functions
COMMENT ON FUNCTION public.handle_guest_profile IS 'Security definer function to safely manage guest profiles with RLS enabled';
COMMENT ON FUNCTION public.get_guest_by_token IS 'Security definer function to safely get guest information by token'; 