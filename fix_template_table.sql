-- First, let's check the structure of the profiles table
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Drop the existing policy that's causing the duplicate error
DROP POLICY IF EXISTS "Authenticated users can read template configurations" ON template_configurations;

-- Create policy for authenticated users with a new name to avoid conflicts
CREATE POLICY "template_configurations_read_policy"
  ON template_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Check if the profiles table has a user_id or id column for the admin policy
-- Assuming the profiles table has an 'id' column that links to auth.uid()
DROP POLICY IF EXISTS "Admins can manage template configurations" ON template_configurations;

-- Create policy for admins to manage templates with the correct column reference
CREATE POLICY "template_configurations_admin_policy"
  ON template_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verify the policies were created correctly
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'template_configurations';