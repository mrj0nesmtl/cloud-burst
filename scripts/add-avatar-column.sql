-- Add avatar_url column to guests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'guests' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE guests ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Confirm the column has been added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'guests' AND column_name = 'avatar_url'; 