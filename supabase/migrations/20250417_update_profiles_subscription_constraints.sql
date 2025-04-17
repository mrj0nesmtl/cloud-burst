-- Update profiles_subscription_status_check constraint to ensure it includes 'free' as a valid value
DO $$
BEGIN
  -- First, check the current constraint
  IF EXISTS (
    SELECT FROM pg_constraint
    WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
    
    -- Re-create with the proper set of values including 'free'
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_status_check 
      CHECK (subscription_status IN ('free', 'trial', 'active', 'cancelled', 'expired', 'past_due'));
      
    RAISE NOTICE 'Updated profiles_subscription_status_check constraint to include "free" as a valid value';
  ELSE
    RAISE NOTICE 'profiles_subscription_status_check constraint not found';
  END IF;
  
  -- Set default value for subscription_status to 'free' which is valid
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE public.profiles 
    ALTER COLUMN subscription_status SET DEFAULT 'free';
    
    RAISE NOTICE 'Updated default value for subscription_status to "free"';
  END IF;
END
$$; 