# Cloud Burst Role Permissions

This document outlines the permissions and access levels for each role in the Cloud Burst platform.

## Role Overview

| Role | Email | Description | Access Level | Subscription |
|------|-------|-------------|--------------|--------------|
| `super_admin` | joel.yaffe@gmail.com | Full system access - internal use only | Highest | N/A |
| `admin` | joel.yaffe+admin@gmail.com | Administrative access - internal use only | High | N/A |
| `organizer` | joel.yaffe+organizer@gmail.com | Event management access - can create and manage multiple events | Medium-High | Paid Only |
| `event_host` | joel.yaffe+eventhost@gmail.com | Can create and manage their own events - cannot delete events | Medium | Free/Paid |
| `invited_user` | joel.yaffe+inviteduser@gmail.com | Invited attendee (QR) - can view own events and galleries | Low-Medium | Free |
| `user` | joel.yaffe+user@gmail.com | Standard user with basic platform access | Low | Free |
| `guest` | joel.yaffe+guest@gmail.com | Public access - can view public events and galleries | Lowest | Free |

## Current Implementation Status

| Role | Database Status | User Created | Capabilities Defined | Notes |
|------|----------------|--------------|---------------------|-------|
| `super_admin` | ✅ Implemented | ✅ Created | ✅ Defined | Working as expected |
| `admin` | ✅ Implemented | ✅ Created | ✅ Defined | Working as expected |
| `organizer` | ✅ Implemented | ⚠️ Using event_host role | ✅ Defined | Need to update subscription tier to paid |
| `event_host` | ✅ Implemented | ✅ Created | ✅ Defined | Need to remove delete capability |
| `invited_user` | ❌ Not implemented | ❌ Not created | ❌ Not defined | Needs to be added |
| `user` | ✅ Implemented | ✅ Created | ✅ Defined | Working as expected |
| `guest` | ✅ Implemented | ✅ Created | ✅ Defined | Working as expected |

## Access Matrix

### Pages and Features

| Feature/Page | super_admin | admin | organizer | event_host | invited_user | user | guest |
|--------------|-------------|-------|-----------|------------|--------------|------|-------|
| **Public Pages** |
| Home Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| About Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Public Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Public Event Gallery | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Protected Pages** |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Profile Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Event Management** |
| View Own Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Own Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Own Events | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Events | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Any Event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Any Event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Attendee Management** |
| Manage Own Event Attendees | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Attendees | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Photo Management** |
| Upload Photos (Own Events) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload Photos (Any Event) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Photos (Own Events) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve Photos (Any Event) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Photos (Own Events) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Photos (Any Event) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Admin Features** |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Role Assignment | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Email Templates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Implementation Tasks

To fully implement the desired role-based access control, the following tasks need to be completed:

1. **Create Invited User Role**:
   - Add 'invited_user' to the allowed roles in the database
   - Define capabilities for this role
   - Create test users with this role

2. **Update Organizer Role**:
   - Update subscription tier for organizer to 'pro' or 'paid'
   - Ensure organizer has appropriate capabilities

3. **Modify Event Host Permissions**:
   - Remove ability to delete events from event_host role
   - Update role_capabilities table accordingly

4. **Implement Subscription Tier Logic**:
   - Add checks to ensure organizer role is only available to paid subscribers
   - Implement upgrade prompts for users attempting to access organizer features

5. **Update UI Components**:
   - Ensure delete buttons are hidden for event hosts
   - Add subscription tier indicators
   - Implement upgrade prompts

## Testing Instructions

### How to Test Each Role

1. **Sign in** with the appropriate email and password
2. **Verify dashboard access** - Check what appears in the sidebar
3. **Test event creation** - Try to create a new event
4. **Test event management** - Try to edit/delete events
5. **Test photo management** - Try to upload/approve/delete photos
6. **Test admin features** - Try to access admin pages

### Expected Behavior by Role

#### Super Admin (joel.yaffe@gmail.com)
- Full access to all features
- Can manage all users, roles, events, and photos
- Can access all admin pages

#### Admin (joel.yaffe+admin@gmail.com)
- Access to all events and photos
- Can manage users but cannot change roles
- Can access most admin pages

#### Organizer (joel.yaffe+organizer@gmail.com)
- Can create and manage multiple events
- Can manage attendees for their events
- Can delete their own events
- Cannot access admin features
- Requires paid subscription

#### Event Host (joel.yaffe+eventhost@gmail.com)
- Can create and manage their own events
- Cannot delete events (even their own)
- Limited to managing only their own events
- Cannot access admin features

#### Invited User (not yet implemented)
- Can view events they're invited to
- Can upload photos to events they're invited to
- Cannot create or manage events

#### User (joel.yaffe+user@gmail.com)
- Can view public events and galleries
- Can upload photos to public events
- Cannot create or manage events

#### Guest (joel.yaffe+guest@gmail.com)
- Can only view public events and galleries
- Cannot upload photos or create content
- Limited to consumption only

## QA Checklist

When testing each role, verify:

1. **Navigation** - Correct menu items appear/disappear
2. **Access Control** - Appropriate pages are accessible/inaccessible
3. **Functionality** - Features work as expected for the role
4. **Error Handling** - Appropriate error messages for unauthorized actions
5. **UI Elements** - Buttons and controls appear/disappear based on permissions
6. **Subscription Tier** - Verify paid features are only available to appropriate tiers 