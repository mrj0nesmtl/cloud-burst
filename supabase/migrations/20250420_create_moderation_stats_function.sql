-- Migration: Add RPC function to get moderation statistics
BEGIN;

-- Create a function to get moderation statistics for specified events
CREATE OR REPLACE FUNCTION get_moderation_stats(event_ids UUID[])
RETURNS TABLE (
  pending_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT
) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Pending count
    (SELECT COUNT(*) FROM media WHERE event_id = ANY(event_ids) AND status = 'pending') AS pending_count,
    
    -- Approved count
    (SELECT COUNT(*) FROM media WHERE event_id = ANY(event_ids) AND status = 'approved') AS approved_count,
    
    -- Rejected count
    (SELECT COUNT(*) FROM media WHERE event_id = ANY(event_ids) AND status = 'rejected') AS rejected_count;
END;
$$;

-- Add permissions for the function
GRANT EXECUTE ON FUNCTION get_moderation_stats TO authenticated;

-- Add a function to get recent moderation activity
CREATE OR REPLACE FUNCTION get_moderation_activity(event_ids UUID[], days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  day DATE,
  approved INTEGER,
  rejected INTEGER
) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  start_date DATE := CURRENT_DATE - days_back;
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::DATE AS day
  ),
  approved_counts AS (
    SELECT 
      DATE(created_at) AS day,
      COUNT(*) AS count
    FROM moderation_logs
    WHERE 
      event_id = ANY(event_ids) AND
      action = 'approved' AND
      created_at >= start_date
    GROUP BY DATE(created_at)
  ),
  rejected_counts AS (
    SELECT 
      DATE(created_at) AS day,
      COUNT(*) AS count
    FROM moderation_logs
    WHERE 
      event_id = ANY(event_ids) AND
      action = 'rejected' AND
      created_at >= start_date
    GROUP BY DATE(created_at)
  )
  SELECT 
    date_range.day,
    COALESCE(approved_counts.count, 0) AS approved,
    COALESCE(rejected_counts.count, 0) AS rejected
  FROM date_range
  LEFT JOIN approved_counts ON date_range.day = approved_counts.day
  LEFT JOIN rejected_counts ON date_range.day = rejected_counts.day
  ORDER BY date_range.day;
END;
$$;

-- Add permissions for the function
GRANT EXECUTE ON FUNCTION get_moderation_activity TO authenticated;

COMMIT; 