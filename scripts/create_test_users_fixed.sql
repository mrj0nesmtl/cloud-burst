-- SQL Script to create test users with different roles
-- Run this in the Supabase SQL Editor

-- First, let's create the users directly in auth.users table
-- We'll use individual statements for better compatibility

-- 1. Admin User
INSERT INTO auth.users (
  email,
  raw_user_meta_data,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
)
VALUES (
  'joel.yaffe+admin@gmail.com',
  '{"name":"Admin User"}',
  NOW(),
  '',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 2. Organizer User
INSERT INTO auth.users (
  email,
  raw_user_meta_data,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
)
VALUES (
  'joel.yaffe+organizer@gmail.com',
  '{"name":"Organizer User"}',
  NOW(),
  '',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Event Host User
INSERT INTO auth.users (
  email,
  raw_user_meta_data,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
)
VALUES (
  'joel.yaffe+eventhost@gmail.com',
  '{"name":"Event Host User"}',
  NOW(),
  '',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 4. Guest User
INSERT INTO auth.users (
  email,
  raw_user_meta_data,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
)
VALUES (
  'joel.yaffe+guest@gmail.com',
  '{"name":"Guest User"}',
  NOW(),
  '',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 5. Standard User
INSERT INTO auth.users (
  email,
  raw_user_meta_data,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  created_at,
  updated_at
)
VALUES (
  'joel.yaffe+user@gmail.com',
  '{"name":"Standard User"}',
  NOW(),
  '',
  '',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Set temporary passwords for all users (they'll need to reset)
-- Note: In a real environment, you'd use a secure method to set passwords

-- Now, create or update profiles for each user with the appropriate role
-- First, get the user IDs from the auth.users table

-- Admin
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

-- Organizer
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

-- Event Host
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

-- Guest
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

-- Verify the users were created
SELECT au.email, p.role 
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.email LIKE 'joel.yaffe+%@gmail.com'
ORDER BY p.role; 