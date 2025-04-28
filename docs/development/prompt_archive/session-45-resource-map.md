# Session 45 Resource Map: Key Files and Directories

> **Version:** 0.9.6  
> **Date:** April 22-25, 2025  
> **Focus:** Critical Path Issues & End-to-End Testing

## Overview
This resource map identifies the key files and directories we'll be focusing on during Session 45. It's organized by our three main focus areas: User (Invited Guest) Flow, Organizer Profile Settings, and Mobile Layout Testing.

## Core Files Requiring Attention

### User Flow Testing
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Invitation Handler | `/src/app/invitation/[token]/page.tsx` | Entry point for guests via invitation link | ✅ Functioning |
| RSVP Form | `/src/components/rsvp/RsvpForm.tsx` | Handles guest RSVP response | ✅ Functioning |
| Guest Profile Setup | `/src/components/guest/ProfileSetup.tsx` | Handles guest profile creation | 🔴 Error on submit |
| Camera Interface | `/src/app/guest/camera/page.tsx` | Main camera interface for guests | ✅ Functioning |
| Gallery View | `/src/app/guest/gallery/page.tsx` | Guest view of event photos | ✅ Needs testing |
| Organizer Moderation View | `/src/app/events/[eventId]/gallery/moderation/page.tsx` | Organizer view of event photos | ✅ Needs testing |

### Critical Issues

#### 1. RSVP > Profile Creation Error | 🔴 Not saving |
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Profile Settings 1st from RSVP Flow "Profile Creation" | `/src/components/settings/ProfileSettings.tsx` | Proile Settings form or Guests | 🔴 Not saving |
| RSVP Form | `/src/components/rsvp/RsvpForm.tsx` | Form UI component | ✅ Functioning |
| Supabase Helper | `/src/lib/supabase/rsvp.ts` | Database interactions for RSVPs | ✅ Functioning |

#### 2. Profile Settings Persistence | 🟡 Needs review |
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Profile Settings | `/src/components/settings/ProfileSettings.tsx` | Settings form for organizers | 🔴 Not saving |
| Profile API | `/src/app/api/profile/update/route.ts` | Handles profile updates | 🔴 Possible issue |
| Supabase Helper | `/src/lib/supabase/profiles.ts` | Database interactions for profiles | 🟡 Needs review |

#### 3. Super Admin Dashboard | 🟡 Needs review |
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Admin Dashboard | `/src/app/protected/admin/dashboard/page.tsx` | Main admin dashboard | 🔴 Missing data |
| Analytics Service | `/src/lib/supabase/analytics.server.ts` | Data aggregation for admin | 🔴 Needs fix |
| Org Helper | `/src/lib/supabase/organizations.ts` | Cross-org data access | 🟡 Needs review |
| System Management | 'src/app/protected/admin/diagnostic/page.tsx' | System diagnostic | 🟡 Needs review |

#### 4. Magic Link Implementation Failure | 🟣 To be created |
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Auth Provider | `/src/contexts/AuthContext.tsx` | Manages auth state | 🔴 Token persistence | 🟣 To be created |
| Magic Link API | `/src/app/api/auth/magic-link/route.ts` | Processes magic link requests | 🔴 Token generation | 🟣 To be created |
| Token Validation | `/src/lib/auth/validate-token.ts` | Validates tokens | 🔴 Inconsistent | 🟣 To be created |
| Guest Auth Flow | `/src/components/auth/GuestAuthWrapper.tsx` | Handles guest auth | 🔴 Context loss | 🟣 To be created |
| New Token Service | `/src/lib/tokens/token-service.ts` | Replacement token system | 🟣 To be created |
| Token Context | `/src/lib/tokens/token-context.tsx` | Context for token state | 🟣 To be created |

#### 5. Email Flow Anomaly | 🟡 Needs review |
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| RSVP Submit Handler | `/src/app/api/rsvp/submit/route.ts` | Processes RSVP submissions | 🔴 Triggering wrong emails |
| Auth Handler | `/src/lib/supabase/auth.ts` | Manages authentication | 🔴 Role confusion |
| Email Service | `/src/lib/email/guest-emails.ts` | Manages guest emails | 🔴 Template selection |
| Email Templates | `/src/app/api/templates/sync/route.ts` | Syncs email templates | 🟡 Needs review |

### Mobile Layout Verification
| Component | File Path | Purpose | Viewport Ranges |
|-----------|-----------|---------|----------------|
| Event Detail | `/src/app/events/[eventId]/page.tsx` | Event information page | 375px-930px |
| Gallery | `/src/app/gallery/[eventId]/page.tsx` | Photo gallery | 375px-930px |
| Moderation UI | `/src/app/events/[eventId]/gallery/moderation/page.tsx` | Photo moderation | 375px-930px |
| Invitation Form | `/src/components/invitations/InvitationForm.tsx` | Create invitations | 375px-930px |
| RSVP Page | `/src/app/invitation/[token]/page.tsx` | RSVP submission | 375px-930px |
| Guest Dashboard | `/src/app/guest/dashboard/page.tsx` | Guest's main interface | 375px-930px |
| Camera Interface | `/src/app/guest/camera/page.tsx` | Photo capture interface | 375px-930px |

## Session 45-B Resources

### Token Management System Implementation
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Token Constants | `/src/lib/tokens/token-constants.ts` | Token types & parameters | 🟣 To be created |
| Token Utilities | `/src/lib/tokens/token-utils.ts` | Token operations | 🟣 To be created |
| Token Service | `/src/lib/tokens/token-service.ts` | Service interface | 🟣 To be created |
| Token Context | `/src/lib/tokens/token-context.tsx` | React context provider | 🟣 To be created |
| Token Documentation | `/docs/development/token_management_system.md` | System documentation | 🟣 To be created |

### Email Flow Correction
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| RSVP Handler | `/src/app/api/rsvp/submit/route.ts` | RSVP submission | 🔴 To fix triggers |
| Guest Email Service | `/src/lib/email/guest-emails.ts` | Email template selection | 🔴 To fix templates |
| Auth Service | `/src/lib/supabase/auth.ts` | Authentication logic | 🔴 Fix role handling |
| Email Flow Docs | `/docs/development/email_flow.md` | Flow documentation | 🟣 To be created |

## Legend
- ✅ Working as expected / Ready for testing
- 🟡 Requires review / Potential issues
- 🔴 Not working / Critical issue
- 🟣 New file to be created

## Development Resources

### Documentation
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase Authentication](https://supabase.io/docs/guides/auth)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn UI Components](https://ui.shadcn.com/)

### Testing Devices
- iPhone 14 Pro Max (430×932)
- iPhone 12 Pro (390×844)
- iPhone XR (414×896)
- iPhone SE (375×667)
- iPad Air (820×1180)

### Testing Accounts
- Super Admin: admin@cloudburst.dev (password in secure note)
- Organizer: organizer@test.com (password in secure note)
- Test Guest: Generated through invitation system

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