-- Create a security definer function to allow server-side operations on guests table
CREATE OR REPLACE FUNCTION public.handle_guest_profile(
  p_invitation_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_notes TEXT,
  p_avatar_url TEXT
) RETURNS SETOF public.guests
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Get the event_id from the invitation for backward compatibility
  SELECT event_id INTO v_event_id 
  FROM public.invitations 
  WHERE id = p_invitation_id;
  
  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation ID or invitation not found';
  END IF;

  RETURN QUERY
  INSERT INTO public.guests (
    invitation_id,  -- Use the invitation_id directly now
    event_id,       -- Still maintain event_id for backward compatibility
    name,
    email,
    phone,
    notes,
    avatar_url,
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
    now()
  )
  ON CONFLICT (invitation_id) DO UPDATE  -- Use invitation_id as the conflict target if it's unique
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

-- Create a security definer function to manage gallery permissions
CREATE OR REPLACE FUNCTION public.manage_gallery_permission(
  p_gallery_id UUID,
  p_user_id UUID,
  p_invitation_id UUID,
  p_access_token TEXT,
  p_permission_level TEXT,
  p_operation TEXT -- 'insert', 'update', or 'delete'
) RETURNS SETOF public.gallery_permissions
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Check if the caller is the gallery owner
  IF NOT EXISTS (
    SELECT 1 FROM galleries g
    JOIN events e ON g.event_id = e.id
    WHERE g.id = p_gallery_id
    AND e.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You do not have permission to manage this gallery';
  END IF;

  IF p_operation = 'insert' THEN
    RETURN QUERY
    INSERT INTO public.gallery_permissions (
      gallery_id,
      user_id,
      invitation_id,
      access_token,
      permission_level,
      created_at
    )
    VALUES (
      p_gallery_id,
      p_user_id,
      p_invitation_id,
      p_access_token,
      p_permission_level,
      now()
    )
    RETURNING *;
  ELSIF p_operation = 'update' THEN
    RETURN QUERY
    UPDATE public.gallery_permissions
    SET
      permission_level = p_permission_level,
      updated_at = now()
    WHERE gallery_id = p_gallery_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_invitation_id IS NOT NULL AND invitation_id = p_invitation_id) OR
      (p_access_token IS NOT NULL AND access_token = p_access_token)
    )
    RETURNING *;
  ELSIF p_operation = 'delete' THEN
    RETURN QUERY
    DELETE FROM public.gallery_permissions
    WHERE gallery_id = p_gallery_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_invitation_id IS NOT NULL AND invitation_id = p_invitation_id) OR
      (p_access_token IS NOT NULL AND access_token = p_access_token)
    )
    RETURNING *;
  ELSE
    RAISE EXCEPTION 'Invalid operation: %', p_operation;
  END IF;
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

-- Create a helper function to link a guest record to an invitation
CREATE OR REPLACE FUNCTION public.link_guest_to_invitation(
  p_guest_id UUID,
  p_invitation_id UUID
) RETURNS SETOF public.guests
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.guests
  SET invitation_id = p_invitation_id,
      updated_at = now()
  WHERE id = p_guest_id
  RETURNING *;
END;
$$;

-- Add security comments to the functions
COMMENT ON FUNCTION public.handle_guest_profile IS 'Security definer function to safely manage guest profiles with RLS enabled';
COMMENT ON FUNCTION public.manage_gallery_permission IS 'Security definer function to safely manage gallery permissions with RLS enabled';
COMMENT ON FUNCTION public.get_guest_by_token IS 'Security definer function to safely get guest information by token';
COMMENT ON FUNCTION public.link_guest_to_invitation IS 'Security definer function to link a guest record to an invitation'; 