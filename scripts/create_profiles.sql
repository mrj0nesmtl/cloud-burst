-- SQL Script to create profiles for existing users
-- Run this in the Supabase SQL Editor

-- Create or update profiles for each user with the appropriate role
-- This script uses the user IDs from auth.users and creates matching profiles

-- Admin User
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joel.yaffe+admin@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Organizer User
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Organizer User',
  'organizer',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joel.yaffe+organizer@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Event Host User
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Event Host User',
  'event_host',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joel.yaffe+eventhost@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Guest User
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Guest User',
  'guest',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joel.yaffe+guest@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Standard User
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Standard User',
  'user',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joel.yaffe+user@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Super Admin (ensure your main account has the super_admin role)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  'Super Admin',
  'super_admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joel.yaffe@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the profiles were created/updated
SELECT au.email, p.role, p.full_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email LIKE 'joel.yaffe%@gmail.com'
ORDER BY p.role; 