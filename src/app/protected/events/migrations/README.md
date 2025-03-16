# Database Migrations

This directory contains SQL migration files for the Cloud Burst application.

## How to Apply Migrations

Migrations should be applied in order of their creation date. 

### Using the Supabase Studio

1. Log in to your Supabase project
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the migration file
5. Run the query

### Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push
```

## Migration Files

- **add_event_fields.sql**: Adds fields for event logo, social media links, and color scheme preferences
- **setup_storage.sql**: Creates and configures the storage bucket for event assets (logos, etc.)
- **add_accent_color.sql**: Adds accent_color field for event gallery background color 