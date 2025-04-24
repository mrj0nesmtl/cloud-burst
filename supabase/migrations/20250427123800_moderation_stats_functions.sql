-- Create functions for moderation statistics and activity tracking
-- This migration adds functions to help with showing moderation stats in the UI

-- Function to get moderation statistics for specific events
CREATE OR REPLACE FUNCTION get_moderation_stats(event_ids UUID[])
RETURNS TABLE (
  status TEXT,
  count BIGINT
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    status,
    COUNT(*) as count
  FROM media
  WHERE event_id = ANY(event_ids)
  GROUP BY status;
$$;

-- Function to get recent moderation activity for charts
CREATE OR REPLACE FUNCTION get_moderation_activity(
  event_ids UUID[],
  days_back INT DEFAULT 7
)
RETURNS TABLE (
  moderation_date DATE,
  status TEXT,
  count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT 
      generate_series(
        (CURRENT_DATE - (days_back || ' days')::INTERVAL)::DATE,
        CURRENT_DATE,
        '1 day'::INTERVAL
      )::DATE AS day
  ),
  moderation_data AS (
    SELECT 
      DATE(moderated_at) as mod_date,
      status,
      COUNT(*) as count
    FROM media
    WHERE 
      event_id = ANY(event_ids)
      AND moderated_at IS NOT NULL
      AND moderated_at >= (CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY mod_date, status
  )
  SELECT 
    dr.day as moderation_date,
    COALESCE(md.status, 'none') as status,
    COALESCE(md.count, 0) as count
  FROM date_range dr
  LEFT JOIN moderation_data md ON dr.day = md.mod_date
  ORDER BY dr.day;
END;
$$;

-- Add RLS policy to allow access to these functions for authenticated users
ALTER FUNCTION get_moderation_stats SECURITY DEFINER SET search_path = public;
ALTER FUNCTION get_moderation_activity SECURITY DEFINER SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_moderation_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_moderation_activity TO authenticated;

-- Create or update table trigger for tracking moderation actions
DROP TRIGGER IF EXISTS on_media_moderation_update ON media;

-- Create function for the trigger
CREATE OR REPLACE FUNCTION on_media_moderation_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track status changes and when moderated_at is set
  IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.moderated_at IS NOT NULL) THEN
    -- Insert record into moderation_logs if table exists
    -- Create table if it doesn't exist
    IF (SELECT to_regclass('public.moderation_logs') IS NULL) THEN
      CREATE TABLE public.moderation_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        media_id UUID REFERENCES public.media(id) ON DELETE CASCADE,
        event_id UUID,
        status_before TEXT,
        status_after TEXT,
        moderator_id UUID,
        note TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Add RLS policy for moderation_logs
      ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Organizers can view moderation logs" ON public.moderation_logs
        FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM events e 
            WHERE e.id = event_id 
            AND (
              e.created_by = auth.uid() 
              OR auth.uid() IN (
                SELECT user_id FROM event_staff 
                WHERE event_id = e.id AND can_moderate = true
              )
            )
          )
        );
    END IF;
    
    -- Insert the log entry
    INSERT INTO public.moderation_logs (
      media_id, 
      event_id,
      status_before, 
      status_after,
      moderator_id,
      note
    ) VALUES (
      NEW.id,
      NEW.event_id,
      OLD.status,
      NEW.status,
      NEW.moderated_by,
      NEW.moderation_note
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_media_moderation_update
  AFTER UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION on_media_moderation_change();

-- Set permissions
ALTER FUNCTION on_media_moderation_change() SECURITY DEFINER SET search_path = public; 