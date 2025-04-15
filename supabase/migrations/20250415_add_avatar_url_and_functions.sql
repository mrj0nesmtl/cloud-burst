-- Add avatar_url column to guests table
ALTER TABLE IF EXISTS public.guests 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create diagnostic function for column inspection
CREATE OR REPLACE FUNCTION public.diagnose_columns(table_name text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable
      )
    )
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = diagnose_columns.table_name
  );
END;
$$; 