-- Add new fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT, 
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS color_scheme TEXT DEFAULT 'light';

-- Add comment for documentation
COMMENT ON COLUMN events.logo_url IS 'URL to the event logo image';
COMMENT ON COLUMN events.instagram_url IS 'URL to the event Instagram profile';
COMMENT ON COLUMN events.facebook_url IS 'URL to the event Facebook page';
COMMENT ON COLUMN events.twitter_url IS 'URL to the event Twitter/X profile';
COMMENT ON COLUMN events.website_url IS 'URL to the event website';
COMMENT ON COLUMN events.color_scheme IS 'Color scheme preference (light/dark) for event pages'; 