-- Script to match user IDs to the correct emails
-- Run this in the Supabase SQL Editor

-- Show the mapping between user IDs and emails
SELECT 
  au.id,
  au.email,
  p.role,
  p.full_name
FROM 
  auth.users au
LEFT JOIN 
  public.profiles p ON au.id = p.id
WHERE 
  au.email LIKE 'joel.yaffe%@gmail.com'
ORDER BY 
  au.email;

-- Create a reference table for easy copy-paste
SELECT 
  'UPDATE public.profiles SET role = ''admin'', full_name = ''Admin User'', username = ''admin'' WHERE id = ''' || id || ''';' AS admin_update,
  email
FROM 
  auth.users
WHERE 
  email = 'joel.yaffe+admin@gmail.com';

SELECT 
  'UPDATE public.profiles SET role = ''organizer'', full_name = ''Organizer User'', username = ''organizer'' WHERE id = ''' || id || ''';' AS organizer_update,
  email
FROM 
  auth.users
WHERE 
  email = 'joel.yaffe+organizer@gmail.com';

SELECT 
  'UPDATE public.profiles SET role = ''event_host'', full_name = ''Event Host User'', username = ''eventhost'' WHERE id = ''' || id || ''';' AS event_host_update,
  email
FROM 
  auth.users
WHERE 
  email = 'joel.yaffe+eventhost@gmail.com';

SELECT 
  'UPDATE public.profiles SET role = ''guest'', full_name = ''Guest User'', username = ''guest'' WHERE id = ''' || id || ''';' AS guest_update,
  email
FROM 
  auth.users
WHERE 
  email = 'joel.yaffe+guest@gmail.com';

SELECT 
  'UPDATE public.profiles SET role = ''user'', full_name = ''Standard User'', username = ''user'' WHERE id = ''' || id || ''';' AS user_update,
  email
FROM 
  auth.users
WHERE 
  email = 'joel.yaffe+user@gmail.com'; 