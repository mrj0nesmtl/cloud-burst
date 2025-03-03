-- Script to verify that profiles were created successfully
-- Run this in the Supabase SQL Editor

-- Check all users and their roles
SELECT 
  au.email, 
  p.role, 
  p.full_name,
  p.username,
  p.created_at,
  p.updated_at
FROM 
  auth.users au
LEFT JOIN 
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

-- Check for any users without profiles
SELECT 
  au.email AS missing_profile
FROM 
  auth.users au
LEFT JOIN 
  public.profiles p ON au.id = p.id
WHERE 
  p.id IS NULL
  AND au.email LIKE 'joel.yaffe%@gmail.com';

-- Check for any profiles with missing required fields
SELECT 
  p.id, 
  au.email,
  p.role
FROM 
  public.profiles p
JOIN 
  auth.users au ON p.id = au.id
WHERE 
  (p.role IS NULL OR p.email IS NULL)
  AND au.email LIKE 'joel.yaffe%@gmail.com';

-- Summary of roles
SELECT 
  p.role, 
  COUNT(*) AS count
FROM 
  public.profiles p
JOIN 
  auth.users au ON p.id = au.id
WHERE 
  au.email LIKE 'joel.yaffe%@gmail.com'
GROUP BY 
  p.role
ORDER BY 
  count DESC; 