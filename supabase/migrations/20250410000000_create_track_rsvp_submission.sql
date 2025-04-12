-- Migration: Create track_rsvp_submission stored procedure
BEGIN;

-- Create a function for tracking RSVP submissions (analytics)
CREATE OR REPLACE FUNCTION public.track_rsvp_submission(
  p_event_id UUID,
  p_invitation_id UUID,
  p_status TEXT,
  p_guest_count INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into analytics_events table
  INSERT INTO public.analytics_events (
    type,
    invitation_id,
    properties,
    created_at
  ) VALUES (
    'rsvp_submission',
    p_invitation_id,
    jsonb_build_object(
      'event_id', p_event_id,
      'status', p_status,
      'guest_count', p_guest_count,
      'timestamp', now()
    ),
    now()
  );
  
  -- Update summary stats for real-time dashboard
  BEGIN
    -- Attempt to update event stats
    WITH stats AS (
      SELECT 
        COUNT(*) FILTER (WHERE status = 'yes') AS accepted_count,
        COUNT(*) FILTER (WHERE status = 'no') AS declined_count,
        SUM(guest_count) FILTER (WHERE status = 'yes') AS total_guests
      FROM public.rsvps
      WHERE invitation_id IN (
        SELECT id FROM public.invitations WHERE event_id = p_event_id
      )
    )
    UPDATE public.events
    SET 
      rsvp_stats = jsonb_build_object(
        'accepted_count', COALESCE((SELECT accepted_count FROM stats), 0),
        'declined_count', COALESCE((SELECT declined_count FROM stats), 0),
        'total_guests', COALESCE((SELECT total_guests FROM stats), 0),
        'last_updated', now()
      ),
      updated_at = now()
    WHERE id = p_event_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE NOTICE 'Failed to update event stats: %', SQLERRM;
  END;

END;
$$;

-- Add permissions for authenticated users to execute this function
GRANT EXECUTE ON FUNCTION public.track_rsvp_submission(UUID, UUID, TEXT, INTEGER) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.track_rsvp_submission IS 'Tracks RSVP submissions and updates analytics';

COMMIT; 