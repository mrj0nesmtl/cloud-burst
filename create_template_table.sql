-- Create template_configurations table
CREATE TABLE IF NOT EXISTS template_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'push', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  html_content TEXT,
  active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_with_auth BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_configurations_template_id ON template_configurations(template_id);
CREATE INDEX IF NOT EXISTS idx_template_configurations_type ON template_configurations(type);

-- Add RLS policies
ALTER TABLE template_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can read template configurations"
  ON template_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for admins to manage templates
CREATE POLICY "Admins can manage template configurations"
  ON template_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default templates
INSERT INTO template_configurations (template_id, name, type, subject, body, html_content)
VALUES
  ('confirm-signup', 'Confirm Sign Up', 'email', 'Confirm Your Cloud Burst Account', 'Thank you for joining Cloud Burst! We''re excited to have you on board.', NULL),
  ('reset-password', 'Reset Password', 'email', 'Reset Your Cloud Burst Password', 'Follow this link to reset your password.', NULL),
  ('magic-link', 'Magic Link', 'email', 'Your Cloud Burst Magic Link', 'Here''s your magic link to sign in to Cloud Burst.', NULL),
  ('change-email', 'Change Email', 'email', 'Confirm Your Email Change', 'Please confirm your email address change.', NULL),
  ('invite', 'Invite', 'email', 'You''re Invited to Join Cloud Burst', 'You''ve been invited to join Cloud Burst.', NULL)
ON CONFLICT (template_id) DO NOTHING; 