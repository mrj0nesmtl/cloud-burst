-- Script to try different roles for the organizer profile
-- Run each UPDATE statement separately to see which roles are allowed

-- First, get the ID of the organizer user
SELECT id, email FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com';

-- Try each of these roles one by one until one works
-- Copy and paste each statement separately

-- Try 'admin' role
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com');

-- Try 'event_host' role
UPDATE public.profiles
SET role = 'event_host'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com');

-- Try 'user' role
UPDATE public.profiles
SET role = 'user'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com');

-- Try 'guest' role
UPDATE public.profiles
SET role = 'guest'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com');

-- Try 'super_admin' role
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com');

-- After finding a working role, update the other fields
UPDATE public.profiles
SET 
  full_name = 'Organizer User',
  username = 'organizer',
  email = 'joel.yaffe+organizer@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com'
);

-- Verify the final state
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
  au.email = 'joel.yaffe+organizer@gmail.com'; 