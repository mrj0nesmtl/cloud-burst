-- Check the invitation status
SELECT id, name, email, rsvp_status 
FROM invitations 
WHERE email = 'joel.yaffe+wedding@gmail.com'; 