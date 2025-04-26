-- Create a function to sync guest data between tables
CREATE OR REPLACE FUNCTION sync_guest_data()
RETURNS TRIGGER AS $$
BEGIN
  -- When a guest record is updated or inserted
  IF TG_TABLE_NAME = 'guests' THEN
    -- Update corresponding event_attendees record
    IF EXISTS (
      SELECT 1 FROM event_attendees 
      WHERE invitation_id = NEW.invitation_id AND event_id = NEW.event_id
    ) THEN
      UPDATE event_attendees
      SET 
        name = NEW.name,
        email = NEW.email,
        phone = NEW.phone,
        updated_at = NEW.updated_at
      WHERE invitation_id = NEW.invitation_id AND event_id = NEW.event_id;
    ELSE
      -- Insert new event_attendees record if it doesn't exist
      INSERT INTO event_attendees (
        invitation_id, event_id, name, email, phone, status, created_at, updated_at
      ) VALUES (
        NEW.invitation_id, NEW.event_id, NEW.name, NEW.email, NEW.phone, 
        'confirmed', NEW.created_at, NEW.updated_at
      );
    END IF;
    
    -- Update invitation email if different
    UPDATE invitations
    SET email = NEW.email
    WHERE id = NEW.invitation_id AND (email IS NULL OR email <> NEW.email);
    
    RETURN NEW;
  END IF;
  
  -- When an event_attendees record is updated or inserted
  IF TG_TABLE_NAME = 'event_attendees' THEN
    -- Update corresponding guest record
    IF EXISTS (
      SELECT 1 FROM guests 
      WHERE invitation_id = NEW.invitation_id AND event_id = NEW.event_id
    ) THEN
      UPDATE guests
      SET 
        name = NEW.name,
        email = NEW.email,
        phone = NEW.phone,
        updated_at = NEW.updated_at
      WHERE invitation_id = NEW.invitation_id AND event_id = NEW.event_id;
    ELSE
      -- Insert new guest record if it doesn't exist
      INSERT INTO guests (
        invitation_id, event_id, name, email, phone, status, access_token, created_at, updated_at
      ) VALUES (
        NEW.invitation_id, NEW.event_id, NEW.name, NEW.email, NEW.phone, 
        'registered', gen_random_uuid(), NEW.created_at, NEW.updated_at
      );
    END IF;
    
    -- Update invitation email if different
    UPDATE invitations
    SET email = NEW.email
    WHERE id = NEW.invitation_id AND (email IS NULL OR email <> NEW.email);
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for guests table
DROP TRIGGER IF EXISTS guest_sync_trigger ON guests;
CREATE TRIGGER guest_sync_trigger
AFTER INSERT OR UPDATE ON guests
FOR EACH ROW
EXECUTE FUNCTION sync_guest_data();

-- Create trigger for event_attendees table
DROP TRIGGER IF EXISTS attendee_sync_trigger ON event_attendees;
CREATE TRIGGER attendee_sync_trigger
AFTER INSERT OR UPDATE ON event_attendees
FOR EACH ROW
EXECUTE FUNCTION sync_guest_data();

-- Comment explaining the triggers
COMMENT ON FUNCTION sync_guest_data() IS 'Maintains data consistency between guests and event_attendees tables'; 