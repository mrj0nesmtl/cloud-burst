#!/bin/bash

# Load environment variables from .env.local - only non-comment, non-empty lines
set -a
source <(grep -v '^#' .env.local | grep -v '^$')
set +a

# Connect to the database
PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -d postgres -U postgres.bxvbovzqzjfomnqidzzx "$@" 