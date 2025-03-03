# Cloud Burst Role Permissions

This document outlines the permissions and access levels for each role in the Cloud Burst platform.

## Role Overview

| Role | Email | Description | Access Level |
|------|-------|-------------|--------------|
| `super_admin` | joel.yaffe@gmail.com | Full system access- internal use only | Highest |
| `admin` | joel.yaffe+admin@gmail.com | Administrative access - internal use only | High |
| `organizer` | joel.yaffe+organizer@gmail.com | Event Organizer - can create events and manage attendees | Medium-High |
| `event_host` | joel.yaffe+eventhost@gmail.com | Event Host - can manage their own events | Medium |
| `invited_user` | joel.yaffe+inviteduser@gmail.com | Invited attendee (QR) - can view own events and galleries | Medium |
| `guest` | joel.yaffe+guest@gmail.com | Public access - can view public events and galleries | Lowest |

## Access Matrix

### Pages and Features

| Feature/Page | super_admin | admin | organizer | event_host | invited_user (QR invite) | guest/public access |
|--------------|-------------|-------|-----------|------------|------|-------|
| **Public Pages** |
| Home Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| About Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Public Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Public Event Gallery | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Protected Pages** |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Profile Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Event Management** |
| View Own Events | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Own Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Own Events | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Events | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Any Event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Any Event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Attendee Management** |
| Manage Own Event Attendees | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View All Attendees | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Photo Management** |
| Upload Photos (Own Events) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload Photos (Any Event) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Photos (Own Events) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Photos (Any Event) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Photos (Own Events) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Photos (Any Event) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Admin Features** |
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Role Assignment | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Email Templates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Testing Instructions

### How to Test Each Role

1. **Sign in** with the appropriate email and password
2. **Verify dashboard access** - Check what appears in the sidebar
3. **Test event creation** - Try to create a new event
4. **Test event management** - Try to edit/delete events
5. **Test photo management** - Try to upload/approve/delete photos
6. **Test admin features** - Try to access admin pages

### Expected Behavior by Role

#### Super Admin
- Full access to all features
- Can manage all users, roles, events, and photos
- Can access all admin pages

#### Admin
- Access to all events and photos
- Can manage users but cannot change roles
- Can access most admin pages

#### Organizer
- Can create and manage multiple events
- Can manage attendees for their events
- Cannot access admin features

#### Event Host
- Can create and manage their own events
- Limited to managing only their own events
- Cannot access admin features

#### User
- Can view public events and galleries
- Can upload photos to public events
- Cannot create or manage events

#### Guest
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