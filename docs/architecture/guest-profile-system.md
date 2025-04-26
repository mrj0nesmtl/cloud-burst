# Guest Profile System Architecture

> **Version:** 1.0.0  
> **Last Updated:** May 11, 2024  
> **Status:** Implemented

## Overview

The Guest Profile System manages guest information across multiple tables in the database, ensuring data consistency and providing a unified API for guest profile management. This document describes the architecture, data flow, and synchronization mechanisms implemented in the system.

## Tables and Relationships

The guest profile data is stored across several tables:

### Invitations Table

- Primary table for guest invitations
- Contains the initial guest information (name, email)
- Has a unique `token` used for authentication
- Related to events via `event_id`

### Event Attendees Table

- Records of who attended which events
- Contains guest information (name, email, phone)
- Related to invitations via `invitation_id`
- Related to events via `event_id`

### Guests Table

- Rich profiles for guests with additional information
- Contains guest information (name, email, phone, notes, avatar)
- Related to invitations via `invitation_id`
- Related to events via `event_id`

### RSVPs Table

- Records RSVP responses for invitations
- Contains RSVP status and additional information
- Related to invitations via `invitation_id`

## Data Flow

The system implements a hierarchical data flow pattern:

1. **Invitations** serve as the foundation, providing basic guest identity
2. **RSVPs** add response information for invitations
3. **Event Attendees** record event participation and basic profile info
4. **Guests** provide rich profile information

When retrieving guest profile data, the system consolidates information from all these sources, with later sources taking precedence over earlier ones.

## Synchronization Mechanisms

### Database Triggers

The system uses PostgreSQL triggers to maintain consistency between tables:

```sql
-- Function that synchronizes data between guests and event_attendees tables
CREATE OR REPLACE FUNCTION sync_guest_data()
RETURNS TRIGGER AS $$
BEGIN
  -- When a guest record is updated or inserted
  IF TG_TABLE_NAME = 'guests' THEN
    -- Update corresponding event_attendees record or create if not exists
    -- ...
  END IF;
  
  -- When an event_attendees record is updated or inserted
  IF TG_TABLE_NAME = 'event_attendees' THEN
    -- Update corresponding guest record or create if not exists
    -- ...
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

Triggers are attached to both the `guests` and `event_attendees` tables to ensure bidirectional synchronization.

### Performance Optimization

To optimize query performance, indexes have been added to frequently queried fields:

```sql
-- Index for looking up attendees by invitation_id
CREATE INDEX idx_event_attendees_invitation_id ON event_attendees (invitation_id);

-- Index for looking up guests by invitation_id
CREATE INDEX idx_guests_invitation_id ON guests (invitation_id);

-- Composite indexes for common filter patterns
CREATE INDEX idx_event_attendees_invitation_event ON event_attendees (invitation_id, event_id);
CREATE INDEX idx_guests_invitation_event ON guests (invitation_id, event_id);
```

### Client-Side API

The system provides a unified API for accessing and updating guest profile data:

```typescript
// Get consolidated guest profile data from all sources
getGuestProfileByToken(token: string): Promise<GuestProfile | null>

// Save guest profile data with automatic synchronization
saveGuestProfile(profile: GuestProfile): Promise<{ success: boolean, error?: any }>

// Check data consistency and repair if needed
checkAndRepairGuestConsistency(token: string): Promise<{ success: boolean, checks: {...} }>
```

## Code Examples

### Retrieving Guest Profile Data

```typescript
// Consolidated function to get guest profile from all sources
export async function getGuestProfileByToken(token: string): Promise<GuestProfile | null> {
  // Get invitation by token
  // Initialize profile with invitation data
  // Enhance with attendee data if exists
  // Enhance with RSVP data if exists
  // Enhance with guest data if exists (highest precedence)
  return profile;
}
```

### Saving Guest Profile Data

```typescript
// Consolidated function to save guest profile to all tables
export async function saveGuestProfile(profile: GuestProfile): Promise<{ success: boolean, error?: any }> {
  // Update or create guest record
  // Update or create event_attendee record
  // Update invitation email if needed
  return { success: true };
}
```

## Troubleshooting

### Common Issues

1. **Data Inconsistency**: If guest profiles appear inconsistent across different views, it may indicate that the synchronization triggers are not working correctly or that historical data hasn't been synchronized.

   **Solution**: Use the `checkAndRepairGuestConsistency` function to verify and repair consistency for a specific invitation token.

2. **Missing Profile Data**: If profile data is missing when it should exist, check that the correct invitation token is being used and that the database tables have the expected relationships.

   **Solution**: Verify the invitation token and check the database directly to ensure the required records exist.

3. **Duplicate Records**: If duplicate guest profiles appear, it may be due to multiple records with the same email or invitation ID.

   **Solution**: Use the database administration tools to identify and merge duplicate records.

### Diagnostic Tools

The system includes a diagnostic admin page at `/protected/admin/diagnostic/guest-consistency` that can be used to check and repair data consistency issues.

### Logs and Monitoring

Critical operations in the guest profile system are logged to the console with appropriate error levels. For production environments, consider implementing a more robust logging solution that captures these events for troubleshooting.

## Future Improvements

1. **Batch Consistency Check**: Implement a batch process to check and repair consistency for all guest profiles.
2. **Audit Trail**: Add an audit trail to track changes to guest profiles across tables.
3. **Conflict Resolution UI**: Create a user interface for manually resolving data conflicts.
4. **Data Migration Tool**: Develop a tool to migrate legacy data to the new synchronized structure.
5. **Real-time Sync**: Implement real-time synchronization using Supabase Realtime subscriptions. 