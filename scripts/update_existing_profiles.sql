-- Script to update existing profiles with correct roles and information
-- Run this in the Supabase SQL Editor

-- Update Admin User
UPDATE public.profiles
SET 
  role = 'admin',
  full_name = 'Admin User',
  username = 'admin',
  email = 'joel.yaffe+admin@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+admin@gmail.com'
);

-- Update Organizer User
UPDATE public.profiles
SET 
  role = 'organizer',
  full_name = 'Organizer User',
  username = 'organizer',
  email = 'joel.yaffe+organizer@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com'
);

-- Update Event Host User
UPDATE public.profiles
SET 
  role = 'event_host',
  full_name = 'Event Host User',
  username = 'eventhost',
  email = 'joel.yaffe+eventhost@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+eventhost@gmail.com'
);

-- Update Guest User
UPDATE public.profiles
SET 
  role = 'guest',
  full_name = 'Guest User',
  username = 'guest',
  email = 'joel.yaffe+guest@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+guest@gmail.com'
);

-- Update Standard User
UPDATE public.profiles
SET 
  role = 'user',
  full_name = 'Standard User',
  username = 'user',
  email = 'joel.yaffe+user@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+user@gmail.com'
);

-- Set status and subscription info for all users
UPDATE public.profiles
SET 
  status = 'active',
  subscription_tier = 'free',
  subscription_status = 'active',
  preferences = '{}',
  metadata = '{}'
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE 'joel.yaffe+%@gmail.com'
);

-- Verify the updates
SELECT 
  au.email, 
  p.role, 
  p.full_name,
  p.username,
  p.status,
  p.subscription_tier,
  p.subscription_status
FROM 
  auth.users au
JOIN 
  public.profiles p ON au.id = p.id
WHERE 
  au.email LIKE 'joel.yaffe%@gmail.com'
ORDER BY 
  CASE 
    WHEN p.role = 'super_admin' THEN 1
    WHEN p.role = 'admin' THEN 2
    WHEN p.role = 'organizer' THEN 3
    WHEN p.role = 'event_host' THEN 4
    WHEN p.role = 'user' THEN 5
    WHEN p.role = 'guest' THEN 6
    ELSE 7
  END; 