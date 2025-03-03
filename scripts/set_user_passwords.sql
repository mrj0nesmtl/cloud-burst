-- Script to set passwords for test users
-- Run this in the Supabase SQL Editor after creating users

-- This uses Supabase's built-in function to update user passwords
-- Note: This requires admin privileges

-- Admin User
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'joel.yaffe+admin@gmail.com';

-- Organizer User
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'joel.yaffe+organizer@gmail.com';

-- Event Host User
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'joel.yaffe+eventhost@gmail.com';

-- Guest User
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'joel.yaffe+guest@gmail.com';

-- Standard User
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'joel.yaffe+user@gmail.com';

-- Verify the updates
SELECT email, encrypted_password IS NOT NULL AS has_password
FROM auth.users
WHERE email LIKE 'joel.yaffe+%@gmail.com'; 