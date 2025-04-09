-- Migration to add trial-related fields to profiles table
BEGIN;

-- Drop existing constraints if they exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_tier_check') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_subscription_tier_check;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_status_check') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_subscription_status_check;
    END IF;
END $$;

-- Add trial-related columns to profiles table if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW();

-- Add constraint to validate subscription_tier
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier = ANY (ARRAY['free', 'basic', 'pro', 'enterprise']));

-- Add constraint to validate subscription_status
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_status_check
CHECK (subscription_status = ANY (ARRAY['free', 'trial', 'active', 'cancelled', 'expired', 'past_due']));

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_profiles_subscription;

-- Add index for subscription queries
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier, subscription_status);

-- Add helpful comments
COMMENT ON COLUMN public.profiles.subscription_tier IS 'The subscription tier of the user (free, basic, pro, enterprise)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'The status of the subscription (free, trial, active, cancelled, expired, past_due)';
COMMENT ON COLUMN public.profiles.trial_expires_at IS 'When the trial period expires';
COMMENT ON COLUMN public.profiles.trial_started_at IS 'When the trial period started';

COMMIT; 