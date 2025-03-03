-- Script to check the profiles table schema
-- Run this in the Supabase SQL Editor to see what fields are required

-- Check the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY 
  ordinal_position;

-- Check for any NOT NULL constraints without defaults
SELECT 
  column_name, 
  data_type
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
  AND is_nullable = 'NO'
  AND column_default IS NULL
  AND column_name NOT IN ('id', 'created_at', 'updated_at');

-- Check for any existing profiles with missing required data
SELECT 
  p.id, 
  p.email, 
  p.role,
  au.email as auth_email
FROM 
  public.profiles p
JOIN 
  auth.users au ON p.id = au.id
WHERE 
  p.role IS NULL OR
  p.email IS NULL;

-- Check for users without profiles
SELECT 
  au.id, 
  au.email
FROM 
  auth.users au
LEFT JOIN 
  public.profiles p ON au.id = p.id
WHERE 
  p.id IS NULL; 