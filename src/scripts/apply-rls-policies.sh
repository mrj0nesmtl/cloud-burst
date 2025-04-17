#!/bin/bash

# Get Supabase connection details from .env.local
source .env.local

echo "Applying updated RLS policies for guests table..."

# Apply the SQL migration
psql "$SUPABASE_DB_URL" -f supabase/migrations/20250417_update_guest_rls_policies.sql

echo "RLS policies updated successfully!" 