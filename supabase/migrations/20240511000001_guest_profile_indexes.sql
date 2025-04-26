-- Add indexes to optimize guest profile queries
-- Index for looking up attendees by invitation_id (frequently used in our code)
CREATE INDEX IF NOT EXISTS idx_event_attendees_invitation_id ON event_attendees (invitation_id);

-- Index for looking up guests by invitation_id (frequently used in our code)
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON guests (invitation_id);

-- Composite index for the tables on both invitation_id and event_id
-- This helps with our common filter pattern and the trigger's EXISTS checks
CREATE INDEX IF NOT EXISTS idx_event_attendees_invitation_event ON event_attendees (invitation_id, event_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_event ON guests (invitation_id, event_id);

-- Add comment for documentation purposes
COMMENT ON INDEX idx_event_attendees_invitation_id IS 'Improves lookup performance when finding attendees by invitation_id';
COMMENT ON INDEX idx_guests_invitation_id IS 'Improves lookup performance when finding guests by invitation_id';
COMMENT ON INDEX idx_event_attendees_invitation_event IS 'Improves performance for composite lookups and trigger operations';
COMMENT ON INDEX idx_guests_invitation_event IS 'Improves performance for composite lookups and trigger operations'; 