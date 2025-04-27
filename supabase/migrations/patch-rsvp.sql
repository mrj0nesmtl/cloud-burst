-- Insert a manual RSVP record for the Wedding Jackson invitation

-- First, identify the invitation ID for Wedding Jackson
WITH invitation AS (
  SELECT id
  FROM invitations 
  WHERE email = 'joel.yaffe+wedding@gmail.com' 
  LIMIT 1
)

-- Then check if an RSVP already exists for this invitation
, existing_rsvp AS (
  SELECT r.id
  FROM rsvps r
  JOIN invitation i ON r.invitation_id = i.id
)

-- Update existing RSVP if one exists
, update_rsvp AS (
  UPDATE rsvps
  SET 
    status = 'accepted',
    guest_count = 2,
    dietary_restrictions = 'No nuts please',
    notes = 'Looking forward to attending!',
    updated_at = NOW()
  FROM existing_rsvp e
  WHERE rsvps.id = e.id
  RETURNING 1
)

-- Insert new RSVP if none exists
INSERT INTO rsvps (
  id,
  invitation_id,
  status,
  guest_count,
  dietary_restrictions,
  notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),  -- Generate a random UUID for the RSVP ID
  id,                 -- Use the invitation ID
  'accepted',         -- Status (accepted)
  2,                  -- Guest count (primary + guest)
  'No nuts please',   -- Dietary restrictions
  'Looking forward to attending!', -- Notes
  NOW(),              -- Created timestamp
  NOW()               -- Updated timestamp
FROM invitation
WHERE NOT EXISTS (SELECT 1 FROM update_rsvp);

-- Also update the invitation status to match
UPDATE invitations
SET 
  rsvp_status = 'accepted',
  rsvp_date = NOW(),
  updated_at = NOW()
WHERE email = 'joel.yaffe+wedding@gmail.com'; 