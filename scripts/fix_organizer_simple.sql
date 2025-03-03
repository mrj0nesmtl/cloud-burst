-- Simple script to fix the organizer profile without changing the role
-- Run this in the Supabase SQL Editor

-- Update only the non-role fields for the organizer profile
UPDATE public.profiles
SET 
  full_name = 'Organizer User',
  username = 'organizer',
  email = 'joel.yaffe+organizer@gmail.com',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com'
);

-- Verify the update
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