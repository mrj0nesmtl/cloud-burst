-- Add avatar_url column to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS avatar_url TEXT; 