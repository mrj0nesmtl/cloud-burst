# Session 45 Resource Map: Key Files and Directories

> **Version:** 0.9.6  
> **Date:** April 28-29, 2025  
> **Focus:** Testing & Bug Fixes

## Overview
This resource map identifies the key files and directories we'll be focusing on during Session 45. It's organized by our three main focus areas: User (Invited Guest) Flow, Organizer Profile Settings, and Mobile Layout Testing.

## 1. User (Invited Guest) Flow

### Invitation & RSVP System
```
/src/app/invitation/[token]/page.tsx        # Public invitation page
/src/app/invitation/[token]/rsvp/page.tsx   # RSVP form page
/src/components/invitation/RsvpForm.tsx     # RSVP form component
/src/app/actions/rsvp.ts                    # Server actions for RSVP submission
/src/lib/supabase/invitations.ts            # Invitation data services
/src/lib/token-manager.ts                   # Token validation and management
```

### Guest Profile & Dashboard
```
/src/app/guest/[token]/profile/page.tsx     # Guest profile creation page
/src/app/guest/[token]/dashboard/page.tsx   # Guest dashboard page
/src/components/guest/ProfileForm.tsx       # Profile creation/edit form
/src/components/guest/GuestHeader.tsx       # Guest navigation header
/src/components/guest/BottomNav.tsx         # Mobile bottom navigation
/src/app/actions/guest-profile.ts           # Server actions for profile management
/src/lib/supabase/guests.ts                 # Guest data services
```

### Camera & Upload
```
/src/app/guest/[token]/camera/page.tsx      # Camera capture page
/src/components/camera/CameraCapture.tsx    # Camera interface component
/src/components/camera/CameraControls.tsx   # Camera control buttons
/src/components/upload/UploadProgress.tsx   # Upload progress indicator
/src/lib/media-upload.ts                    # Media upload utilities
/src/app/actions/upload.ts                  # Server actions for media uploads
/src/lib/supabase/storage.ts                # Storage-related services
```

### Gallery Viewing
```
/src/app/guest/[token]/gallery/page.tsx     # Guest gallery page
/src/components/gallery/MediaGrid.tsx       # Media display grid
/src/components/gallery/MediaViewer.tsx     # Media detail viewer/lightbox
/src/components/gallery/MediaCard.tsx       # Individual media card component
/src/lib/supabase/gallery.ts                # Gallery data services
```

## 2. Organizer Profile Settings

### Profile Management
```
/src/app/protected/settings/profile/page.tsx      # Organizer profile settings page
/src/components/settings/ProfileSettings.tsx       # Profile edit form component
/src/components/settings/AccountSettings.tsx       # Account settings component
/src/components/settings/SettingsLayout.tsx        # Settings page layout
/src/app/actions/profile.ts                        # Server actions for profile updates
/src/lib/hooks/useProfile.ts                       # Profile data management hook
```

### Authentication & Data Persistence
```
/src/lib/supabase/auth.ts                    # Auth-related services
/src/lib/supabase/profiles.ts                # Profile data services
/src/lib/supabase/server.ts                  # Server-side Supabase client
/src/lib/hooks/useAuth.ts                    # Authentication hook
/src/store/authStore.ts                      # Auth state management
/src/middleware.ts                           # Authentication middleware
```

### Form Components
```
/src/components/ui/form.tsx                  # Form component
/src/components/ui/input.tsx                 # Input field component
/src/components/ui/button.tsx                # Button component
/src/components/ui/select.tsx                # Select dropdown component
/src/components/ui/textarea.tsx              # Text area component
/src/components/ui/toast.tsx                 # Toast notification component
/src/lib/utils/form-utils.ts                 # Form utility functions
```

## 3. Super Admin Dashboard

### Dashboard Pages
```
/src/app/protected/admin/dashboard/page.tsx        # Admin dashboard page
/src/app/protected/admin/organizers/page.tsx       # Organizers management page
/src/app/protected/admin/analytics/page.tsx        # Platform analytics page
/src/components/admin/AdminNav.tsx                 # Admin navigation
/src/components/admin/OrganizersList.tsx           # Organizers list component
```

### Analytics Components
```
/src/components/analytics/OverviewChart.tsx        # Overview analytics chart
/src/components/analytics/MetricsCards.tsx         # Metrics display cards
/src/components/analytics/ActivityFeed.tsx         # Activity feed component
/src/components/analytics/TimeRangeFilter.tsx      # Time range filter control
/src/lib/supabase/analytics.server.ts              # Analytics data services
/src/lib/hooks/useAnalytics.ts                     # Analytics data hook
```

## 4. Mobile Layout Testing

### Core Layout Components
```
/src/app/layout.tsx                          # Root layout
/src/app/protected/layout.tsx                # Protected area layout
/src/components/layout/Header.tsx            # Header component
/src/components/layout/Sidebar.tsx           # Sidebar navigation
/src/components/layout/MobileNav.tsx         # Mobile navigation
/src/components/layout/PageContainer.tsx     # Page container component
```

### Responsive Components
```
/src/components/ui/sheet.tsx                 # Mobile sheet/drawer component
/src/components/ui/dropdown-menu.tsx         # Dropdown menu component
/src/components/ui/dialog.tsx                # Dialog/modal component
/src/components/ui/tabs.tsx                  # Tabs component
/src/components/ui/card.tsx                  # Card component
/src/styles/globals.css                      # Global styles and media queries
```

### Key Screens for Mobile Testing
```
/src/app/protected/events/[id]/page.tsx              # Event detail page
/src/app/protected/gallery/page.tsx                  # Gallery page
/src/app/protected/gallery/moderation/page.tsx       # Media moderation page
/src/app/invitation/[token]/page.tsx                 # Public invitation page
/src/app/guest/[token]/dashboard/page.tsx            # Guest dashboard
/src/app/guest/[token]/camera/page.tsx               # Camera interface
/src/app/guest/[token]/gallery/page.tsx              # Guest gallery view
```

## 5. Authentication Error Fix Reference

These files were modified to fix the "cookies was called outside a request scope" error and may be useful for context when testing:

```
/src/lib/supabase/media.server.ts           # Modified getServerClient function
/src/lib/supabase/server.ts                 # Updated createClient function
/docs/development/auth-security-improvements.md  # Documentation of the issue and solution
```

## 6. Testing Environment

### Test Accounts
```
- Super Admin: admin@cloudburst.test / Password123!
- Organizer: organizer@cloudburst.test / Password123!
- Event Staff: staff@cloudburst.test / Password123!
- Photographer: photographer@cloudburst.test / Password123!
- Standard User: user@cloudburst.test / Password123!
```

### Test Events
```
- Template Event: 'Annual Company Retreat 2025' (ID: 607c49df-223f-465f-a4f9-03306658bf9f)
- Published Event: 'Summer Beach Party' (ID: 7677edfc-65d5-4fd6-84fa-30181584fe62)
- Draft Event: 'Team Building Workshop' (ID: 45a8dc66-b2e9-4f8c-955d-5f7eb91a1234)
```

### Test Invitations
```
- Active Invitation: 'Beach Party Guest' (Token: inv_8ff2ee78-9ab1-4def-8123-456789abcdef)
- Pending Invitation: 'Workshop Guest' (Token: inv_5a7b9c3d-1e2f-3a4b-5c6d-7e8f9a0b1c2d)
```

## 7. Additional Resources

### Documentation
```
/docs/development/STATUS_NOTES.md           # Current project status
/docs/development/auth-security-improvements.md  # Authentication security notes
/docs/user-flows/guest-journey.md           # Guest journey documentation
/docs/features/moderation-system.md         # Moderation system documentation
```

### Database Schema
```
/migrations/                                # Database migrations
/schema.sql                                 # Database schema export
```

### Troubleshooting
```
/docs/troubleshooting/auth-issues.md        # Authentication troubleshooting guide
/docs/troubleshooting/supabase-client.md    # Supabase client troubleshooting
/docs/development/known-issues.md           # Known issues and workarounds
``` 