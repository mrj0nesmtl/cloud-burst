-- Comprehensive script to create complete profiles for all users
-- Run this in the Supabase SQL Editor

-- First, let's check what columns exist in the profiles table
DO $$
DECLARE
    column_record RECORD;
    column_list TEXT := '';
    select_list TEXT := '';
    insert_columns TEXT := '';
    insert_values TEXT := '';
    update_set TEXT := '';
    sql_statement TEXT;
BEGIN
    -- Build column lists for our dynamic SQL
    FOR column_record IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name NOT IN ('id', 'created_at', 'updated_at')
        ORDER BY ordinal_position
    LOOP
        column_list := column_list || column_record.column_name || ', ';
        
        -- For the SELECT part (from auth.users)
        IF column_record.column_name = 'email' THEN
            select_list := select_list || 'email, ';
        ELSIF column_record.column_name = 'role' THEN
            select_list := select_list || 'role_value, ';
        ELSIF column_record.column_name = 'full_name' THEN
            select_list := select_list || 'name_value, ';
        ELSIF column_record.column_name = 'avatar_url' THEN
            select_list := select_list || 'NULL, ';
        ELSIF column_record.column_name = 'username' THEN
            select_list := select_list || 'username_value, ';
        ELSE
            select_list := select_list || 'NULL, ';
        END IF;
        
        -- For the UPDATE part
        IF column_record.column_name != 'id' THEN
            update_set := update_set || column_record.column_name || ' = EXCLUDED.' || column_record.column_name || ', ';
        END IF;
    END LOOP;
    
    -- Add the required id, created_at, updated_at columns
    column_list := column_list || 'id, created_at, updated_at';
    select_list := select_list || 'id, NOW(), NOW()';
    update_set := update_set || 'updated_at = NOW()';
    
    -- Process each user type
    DECLARE
        user_types TEXT[] := ARRAY['super_admin', 'admin', 'organizer', 'event_host', 'guest', 'user'];
        user_type TEXT;
        email_pattern TEXT;
        role_value TEXT;
        name_value TEXT;
        username_value TEXT;
    BEGIN
        FOREACH user_type IN ARRAY user_types
        LOOP
            -- Set values based on user type
            IF user_type = 'super_admin' THEN
                email_pattern := 'joel.yaffe@gmail.com';
                role_value := 'super_admin';
                name_value := 'Super Admin';
                username_value := 'superadmin';
            ELSIF user_type = 'admin' THEN
                email_pattern := 'joel.yaffe+admin@gmail.com';
                role_value := 'admin';
                name_value := 'Admin User';
                username_value := 'admin';
            ELSIF user_type = 'organizer' THEN
                email_pattern := 'joel.yaffe+organizer@gmail.com';
                role_value := 'organizer';
                name_value := 'Organizer User';
                username_value := 'organizer';
            ELSIF user_type = 'event_host' THEN
                email_pattern := 'joel.yaffe+eventhost@gmail.com';
                role_value := 'event_host';
                name_value := 'Event Host User';
                username_value := 'eventhost';
            ELSIF user_type = 'guest' THEN
                email_pattern := 'joel.yaffe+guest@gmail.com';
                role_value := 'guest';
                name_value := 'Guest User';
                username_value := 'guest';
            ELSE
                email_pattern := 'joel.yaffe+user@gmail.com';
                role_value := 'user';
                name_value := 'Standard User';
                username_value := 'user';
            END IF;
            
            -- Build and execute the SQL statement
            sql_statement := 'INSERT INTO public.profiles (' || column_list || ') ' ||
                            'SELECT ' || select_list || ' ' ||
                            'FROM auth.users ' ||
                            'WHERE email = ''' || email_pattern || ''' ' ||
                            'ON CONFLICT (id) DO UPDATE SET ' || update_set;
            
            -- Replace placeholders with actual values
            sql_statement := REPLACE(sql_statement, 'role_value', '''' || role_value || '''');
            sql_statement := REPLACE(sql_statement, 'name_value', '''' || name_value || '''');
            sql_statement := REPLACE(sql_statement, 'username_value', '''' || username_value || '''');
            
            -- Execute the statement
            EXECUTE sql_statement;
            
            -- Log what we did
            RAISE NOTICE 'Updated profile for %: %', user_type, email_pattern;
        END LOOP;
    END;
END $$;

-- Verify the profiles were created/updated
SELECT au.email, p.role, p.full_name, p.username
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email LIKE 'joel.yaffe%@gmail.com'
ORDER BY p.role; 