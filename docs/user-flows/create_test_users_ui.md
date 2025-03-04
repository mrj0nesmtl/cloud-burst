# Creating Test Users via Supabase UI

If you're having trouble with the SQL script, you can create test users manually through the Supabase UI. Here's how:

## Step 1: Create Users in Authentication

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **+ Add User** button
4. For each user, enter:
   - Email: (use the email addresses below)
   - Password: `Password123!` (or any password you prefer)
   - Click **Create User**

Repeat for each of these email addresses:
- joel.yaffe+admin@gmail.com
- joel.yaffe+organizer@gmail.com
- joel.yaffe+eventhost@gmail.com
- joel.yaffe+guest@gmail.com
- joel.yaffe+user@gmail.com

## Step 2: Set User Roles in Profiles Table

1. Go to **Table Editor**
2. Select the **profiles** table
3. For each user:
   - Find the user by their email
   - Click to edit the row
   - Set the **role** field to the appropriate value:
     - joel.yaffe+admin@gmail.com → `admin`
     - joel.yaffe+organizer@gmail.com → `organizer`
     - joel.yaffe+eventhost@gmail.com → `event_host`
     - joel.yaffe+guest@gmail.com → `guest`
     - joel.yaffe+user@gmail.com → `user`
   - Click **Save**

## Step 3: Verify Users

1. Go to **SQL Editor**
2. Run this query to verify all users were created with the correct roles:

```sql
SELECT au.email, p.role 
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.email LIKE 'joel.yaffe+%@gmail.com'
ORDER BY p.role;
```

## Step 4: Reset Passwords (Optional)

If you need to reset passwords:

1. Go to **Authentication** > **Users**
2. Find the user
3. Click the three dots (⋮) menu
4. Select **Reset password**
5. Choose **Send password recovery email** or **Create a new password**

## Step 5: Test Login

1. Open your application
2. Try logging in with each user
3. Verify that the appropriate permissions are applied based on the role

## Troubleshooting

If users don't appear in the profiles table:

1. Go to **SQL Editor**
2. Run this query to insert missing profiles:

```sql
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'User ' || email,
  'user', -- Default role, change as needed
  NOW(),
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
```

Then update the roles manually as described in Step 2. 