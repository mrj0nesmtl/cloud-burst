-- Create table for auth tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  token text NOT NULL,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  used boolean DEFAULT false NOT NULL
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);

-- Create index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- Create index for token type
CREATE INDEX IF NOT EXISTS idx_auth_tokens_type ON auth_tokens(type);

-- Set up RLS policies
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Only service roles and admins can read tokens
CREATE POLICY "Service roles can read tokens" 
  ON auth_tokens 
  FOR SELECT 
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'supabase_admin'
  );

-- Only service roles and admins can insert tokens
CREATE POLICY "Service roles can insert tokens" 
  ON auth_tokens 
  FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'supabase_admin'
  );

-- Only service roles and admins can update tokens
CREATE POLICY "Service roles can update tokens" 
  ON auth_tokens 
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'supabase_admin'
  );

-- Only service roles and admins can delete tokens
CREATE POLICY "Service roles can delete tokens" 
  ON auth_tokens 
  FOR DELETE 
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'supabase_admin'
  );

-- Create function to automatically clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_tokens
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment to the token table
COMMENT ON TABLE auth_tokens IS 'Stores authentication tokens such as magic links';

-- Try to set up scheduled maintenance task if pg_cron extension is available
DO $$
BEGIN
  -- Check if the pg_cron extension is available
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- If pg_cron is available, schedule the cleanup function
    PERFORM cron.schedule(
      'cleanup-expired-tokens', -- name of the job
      '0 2 * * *',             -- cron schedule (daily at 2am)
      $$SELECT cleanup_expired_tokens()$$ -- SQL to execute
    );
  ELSE
    -- Log that pg_cron is not available
    RAISE NOTICE 'pg_cron extension not available. Scheduled cleanup will not be set up. You can enable it or manually run cleanup_expired_tokens() periodically.';
    
    -- Alternative: you could set up a trigger to clean up on insert/update
    -- This is a simple example and might not be ideal for all use cases
    CREATE OR REPLACE FUNCTION cleanup_expired_tokens_trigger()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Clean up expired tokens with some probability to avoid doing it on every operation
      IF random() < 0.01 THEN -- 1% chance to run cleanup
        PERFORM cleanup_expired_tokens();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create trigger that occasionally runs cleanup on insert
    DROP TRIGGER IF EXISTS trigger_cleanup_expired_tokens ON auth_tokens;
    CREATE TRIGGER trigger_cleanup_expired_tokens
      AFTER INSERT ON auth_tokens
      FOR EACH STATEMENT
      EXECUTE FUNCTION cleanup_expired_tokens_trigger();
  END IF;
END
$$; 