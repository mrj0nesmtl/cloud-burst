-- Script to fix the organizer profile with a valid role value
-- Run this in the Supabase SQL Editor

-- First, let's check what roles are allowed in the profiles table
SELECT 
  enumlabel 
FROM 
  pg_enum 
WHERE 
  enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'user_role'
  );

-- Now, update the organizer profile with a valid role
-- Since 'organizer' isn't allowed, we'll use 'admin' as a fallback
-- You can change this to another role if needed
UPDATE public.profiles
SET 
  role = 'admin', -- Using 'admin' as a fallback
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