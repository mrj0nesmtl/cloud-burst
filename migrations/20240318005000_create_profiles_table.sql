-- Migration: Create profiles table and user registration trigger
BEGIN;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    email TEXT,
    status TEXT DEFAULT 'active',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    trial_expires_at TIMESTAMPTZ,
    trial_started_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT profiles_role_check CHECK (role IN ('super_admin', 'admin', 'organizer', 'event_host', 'event_staff', 'invited_user', 'user', 'guest')),
    CONSTRAINT profiles_subscription_tier_check CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
    CONSTRAINT profiles_subscription_status_check CHECK (subscription_status IN ('free', 'trial', 'active', 'cancelled', 'expired', 'past_due')),
    CONSTRAINT profiles_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- RLS Policies

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin')
    )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- Users can't update their role through this policy
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        -- Ensure other critical fields aren't modified
        AND id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        AND email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        AND subscription_tier = (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
        AND subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
        AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
    )
);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin')
    )
);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at_trigger ON public.profiles;
CREATE TRIGGER handle_updated_at_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    -- Determine the role based on email
    assigned_role := 
        CASE 
            WHEN NEW.email = 'joel.yaffe@gmail.com' THEN 'super_admin'
            WHEN NEW.email LIKE '%@cloudburst.com' THEN 'admin'
            ELSE 'user'
        END;

    INSERT INTO public.profiles (
        id,
        email,
        username,
        role,
        full_name,
        status,
        subscription_status,
        preferences,
        metadata
    )
    VALUES (
        NEW.id,
        NEW.email,
        LOWER(SPLIT_PART(NEW.email, '@', 1)), -- Generate username from email
        assigned_role,
        NEW.raw_user_meta_data->>'full_name',
        'active',
        'active',
        '{}',
        '{}'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comments
COMMENT ON TABLE public.profiles IS 'User profiles with role and subscription information';
COMMENT ON COLUMN public.profiles.id IS 'References the auth.users id';
COMMENT ON COLUMN public.profiles.username IS 'Unique username for the user';
COMMENT ON COLUMN public.profiles.role IS 'User role that determines permissions';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user avatar image';
COMMENT ON COLUMN public.profiles.status IS 'Account status (active, inactive, suspended)';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'User subscription tier (free, basic, pro, enterprise)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status of the subscription';
COMMENT ON COLUMN public.profiles.subscription_end_date IS 'When the subscription ends';
COMMENT ON COLUMN public.profiles.last_login IS 'Last login timestamp';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences as JSON';
COMMENT ON COLUMN public.profiles.metadata IS 'Additional user metadata as JSON';
COMMENT ON COLUMN public.profiles.trial_expires_at IS 'When the trial period expires';
COMMENT ON COLUMN public.profiles.trial_started_at IS 'When the trial period started';

COMMIT; 