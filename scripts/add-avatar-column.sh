#!/bin/bash

# Source environment variables
source "$(dirname "$0")/../.env.local"

# Check if required environment variables are set
if [[ -z "$NEXT_PUBLIC_SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo "Error: Missing required environment variables."
  echo "Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
  exit 1
fi

# Extract connection details from SUPABASE_URL
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL#https://}
SUPABASE_HOST=${SUPABASE_URL%%.*}
SUPABASE_PASSWORD=$SUPABASE_SERVICE_ROLE_KEY

# Execute the SQL file
echo "Connecting to Supabase database and executing SQL..."
PGPASSWORD=$SUPABASE_PASSWORD psql \
  -h db.${SUPABASE_URL} \
  -p 5432 \
  -U postgres \
  -d postgres \
  -f "$(dirname "$0")/add-avatar-column.sql"

echo "Script execution completed." 