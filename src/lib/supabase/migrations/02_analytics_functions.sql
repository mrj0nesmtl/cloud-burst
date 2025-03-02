-- Function to get events by month
CREATE OR REPLACE FUNCTION get_events_by_month()
RETURNS TABLE (
  month TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    TO_CHAR(created_at, 'Mon') as month,
    COUNT(*) as count
  FROM events
  WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
  GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
  ORDER BY EXTRACT(MONTH FROM created_at);
$$;

-- Function to get users by role
CREATE OR REPLACE FUNCTION get_users_by_role()
RETURNS TABLE (
  role TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    role,
    COUNT(*) as count
  FROM profiles
  GROUP BY role
  ORDER BY count DESC;
$$;

-- Function to get event registrations by status
CREATE OR REPLACE FUNCTION get_registrations_by_status()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    status,
    COUNT(*) as count
  FROM event_registrations
  GROUP BY status
  ORDER BY count DESC;
$$;

-- Function to get contact form submissions by status
CREATE OR REPLACE FUNCTION get_submissions_by_status()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    status,
    COUNT(*) as count
  FROM contact_form_submissions
  GROUP BY status
  ORDER BY count DESC;
$$;

-- Function to get newsletter subscribers by status
CREATE OR REPLACE FUNCTION get_subscribers_by_status()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    status,
    COUNT(*) as count
  FROM newsletter_subscribers
  GROUP BY status
  ORDER BY count DESC;
$$;

-- Function to get pricing plan subscriptions by status
CREATE OR REPLACE FUNCTION get_subscriptions_by_status()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    status,
    COUNT(*) as count
  FROM pricing_plan_subscriptions
  GROUP BY status
  ORDER BY count DESC;
$$;

-- Function to get recent activity (combined events, registrations, submissions)
CREATE OR REPLACE FUNCTION get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  activity_type TEXT,
  activity_id UUID,
  activity_title TEXT,
  activity_status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  (SELECT 
    'event' as activity_type,
    id as activity_id,
    name as activity_title,
    status as activity_status,
    created_at
  FROM events
  ORDER BY created_at DESC
  LIMIT limit_count)
  
  UNION ALL
  
  (SELECT 
    'registration' as activity_type,
    id as activity_id,
    registration_type as activity_title,
    status as activity_status,
    created_at
  FROM event_registrations
  ORDER BY created_at DESC
  LIMIT limit_count)
  
  UNION ALL
  
  (SELECT 
    'submission' as activity_type,
    id as activity_id,
    subject as activity_title,
    status as activity_status,
    created_at
  FROM contact_form_submissions
  ORDER BY created_at DESC
  LIMIT limit_count)
  
  ORDER BY created_at DESC
  LIMIT limit_count;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_events_by_month TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_registrations_by_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_submissions_by_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscribers_by_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscriptions_by_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity TO authenticated;

-- Create RLS policies to restrict access to these functions
CREATE POLICY "Allow admins to use analytics functions" 
ON profiles
FOR SELECT
TO authenticated
USING (role IN ('super_admin', 'admin')); 