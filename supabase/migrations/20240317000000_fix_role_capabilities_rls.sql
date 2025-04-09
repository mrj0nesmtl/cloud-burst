-- Enable RLS on role_capabilities table if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'role_capabilities'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE role_capabilities ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read role capabilities" ON role_capabilities;
DROP POLICY IF EXISTS "Allow admins to modify role capabilities" ON role_capabilities;
DROP POLICY IF EXISTS "Allow users to read their role capabilities" ON role_capabilities;

-- Create policy to allow users to read capabilities for their role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_capabilities' 
        AND policyname = 'Allow users to read their role capabilities'
    ) THEN
        CREATE POLICY "Allow users to read their role capabilities"
        ON role_capabilities
        FOR SELECT
        TO authenticated
        USING (
            role IN (
                SELECT role FROM profiles WHERE id = auth.uid()
                UNION
                SELECT 'guest'  -- Always allow reading guest capabilities
            )
        );
    END IF;
END $$;

-- Allow admins to read all capabilities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_capabilities' 
        AND policyname = 'Allow admins to read all capabilities'
    ) THEN
        CREATE POLICY "Allow admins to read all capabilities"
        ON role_capabilities
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('super_admin', 'admin')
            )
        );
    END IF;
END $$;

-- Only allow super_admin and admin to modify role capabilities
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_capabilities' 
        AND policyname = 'Allow admins to modify role capabilities'
    ) THEN
        CREATE POLICY "Allow admins to modify role capabilities"
        ON role_capabilities
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('super_admin', 'admin')
            )
        );
    END IF;
END $$;

-- Verify policies are in place
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'role_capabilities'
        AND (
            policyname IN (
                'Allow users to read their role capabilities',
                'Allow admins to read all capabilities',
                'Allow admins to modify role capabilities'
            )
        )
    ) THEN
        RAISE EXCEPTION 'Policies were not created successfully';
    END IF;
END $$; 