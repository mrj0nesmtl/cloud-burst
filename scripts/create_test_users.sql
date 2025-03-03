-- SQL Script to create test users with different roles
-- Run this in the Supabase SQL Editor

-- First, create the users in auth.users table
-- Note: This uses Supabase's built-in function to create users with passwords

-- 1. Admin User
SELECT auth.create_user(
  'joel.yaffe+admin@gmail.com',
  'Password123!',
  {
    email_confirm: true,
    phone_confirm: true
  }
);

-- 2. Organizer User
SELECT auth.create_user(
  'joel.yaffe+organizer@gmail.com',
  'Password123!',
  {
    email_confirm: true,
    phone_confirm: true
  }
);

-- 3. Event Host User
SELECT auth.create_user(
  'joel.yaffe+eventhost@gmail.com',
  'Password123!',
  {
    email_confirm: true,
    phone_confirm: true
  }
);

-- 4. Guest User
SELECT auth.create_user(
  'joel.yaffe+guest@gmail.com',
  'Password123!',
  {
    email_confirm: true,
    phone_confirm: true
  }
);

-- 5. Standard User
SELECT auth.create_user(
  'joel.yaffe+user@gmail.com',
  'Password123!',
  {
    email_confirm: true,
    phone_confirm: true
  }
);

-- Now, create or update profiles for each user with the appropriate role
-- First, get the user IDs from the auth.users table

DO $$
DECLARE
    admin_id UUID;
    organizer_id UUID;
    event_host_id UUID;
    guest_id UUID;
    user_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM auth.users WHERE email = 'joel.yaffe+admin@gmail.com';
    SELECT id INTO organizer_id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com';
    SELECT id INTO event_host_id FROM auth.users WHERE email = 'joel.yaffe+eventhost@gmail.com';
    SELECT id INTO guest_id FROM auth.users WHERE email = 'joel.yaffe+guest@gmail.com';
    SELECT id INTO user_id FROM auth.users WHERE email = 'joel.yaffe+user@gmail.com';

    -- Create or update profiles
    -- Admin
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (admin_id, 'joel.yaffe+admin@gmail.com', 'Admin User', 'admin', NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Organizer
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (organizer_id, 'joel.yaffe+organizer@gmail.com', 'Organizer User', 'organizer', NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Event Host
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (event_host_id, 'joel.yaffe+eventhost@gmail.com', 'Event Host User', 'event_host', NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Guest
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (guest_id, 'joel.yaffe+guest@gmail.com', 'Guest User', 'guest', NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Standard User
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (user_id, 'joel.yaffe+user@gmail.com', 'Standard User', 'user', NOW(), NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();
END $$;

-- Verify the users were created
SELECT au.email, p.role 
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.email LIKE 'joel.yaffe+%@gmail.com'
ORDER BY p.role; 