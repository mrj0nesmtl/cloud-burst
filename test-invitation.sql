-- Find existing invitations
SELECT id, token, email, name, event_id, status, rsvp_status 
FROM invitations 
LIMIT 5;

-- If no invitations exist, first make sure we have an event
SELECT id, name, date FROM events LIMIT 5;

-- Then create a test invitation (uncomment and run this if needed)
/*
INSERT INTO invitations (
  event_id, 
  email, 
  name, 
  token, 
  status, 
  rsvp_status, 
  expires_at, 
  metadata
)
VALUES (
  '<YOUR_EVENT_ID_HERE>', -- Replace with an actual event ID from the events table
  'test@example.com',
  'Test User',
  uuid_generate_v4(),  -- Generate a random UUID
  'sent',
  'pending',
  NOW() + INTERVAL '7 days',
  '{"plus_one_allowed": true, "notes": "", "dietary_preferences": ""}'::jsonb
)
RETURNING id, token;
*/

-- To see RSVP responses 
SELECT i.id, i.name, i.email, i.token, i.status, i.rsvp_status, r.status, r.guest_count, r.dietary_restrictions, r.notes
FROM invitations i
LEFT JOIN rsvps r ON i.id = r.invitation_id
LIMIT 5;

-- Direct link to test an invitation: http://localhost:3000/invitation/<TOKEN> 