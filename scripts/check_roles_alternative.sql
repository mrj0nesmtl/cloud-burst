-- Alternative queries to check what roles are allowed in the profiles table
-- Run this in the Supabase SQL Editor

-- Method 1: Check table constraints
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM 
  pg_constraint
WHERE 
  conrelid = 'public.profiles'::regclass
  AND contype = 'c'; -- 'c' means check constraint

-- Method 2: Check column definition
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  udt_name
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'role';

-- Method 3: Check existing values in the role column
SELECT DISTINCT 
  role 
FROM 
  public.profiles
WHERE 
  role IS NOT NULL
ORDER BY 
  role;

-- Method 4: Check if there's a custom type for roles
SELECT 
  t.typname AS type_name,
  t.typtype AS type_type,
  n.nspname AS schema_name
FROM 
  pg_type t
JOIN 
  pg_namespace n ON t.typnamespace = n.oid
WHERE 
  t.typname LIKE '%role%'
  OR t.typname LIKE '%user%';

-- Method 5: If it's a foreign key, check the referenced table
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
JOIN
  information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN
  information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'profiles'
  AND kcu.column_name = 'role'; 