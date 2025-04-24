# Session 44 Resources Map

## Key Documentation

### Session Documentation
- `docs/development/session-44-kickoff-prompt.md` - Session narrative and goals
- `docs/development/session-44-checklist.md` - Task list and progress tracking
- `docs/development/STATUS_NOTES.md` - Current status and progress notes

### Architecture & Technical Documents
- `docs/architecture/permission-policies.md` - Permission structure and enforcement
- `docs/architecture/user-journeys.md` - User flows and pathways
- `docs/security/security-audit.md` - Security review findings (to be created)
- `docs/development/moderation-interface-enhancements.md` - Moderation system documentation

### User Experience Documents
- `docs/ux/guest-onboarding-flow.md` - Guest onboarding journey (to be created)
- `docs/ux/organizer-registration-flow.md` - Organizer registration process (to be created)
- `docs/ux/moderation-workflow.md` - Photo moderation workflow (to be created)

## Relevant Code Structure

### User Authentication & Profile Management
```
src/
├── app/
│   ├── auth/
│   │   ├── signin/                  # Sign-in functionality
│   │   ├── signup/                  # Sign-up (needs QA)
│   │   ├── reset-password/          # Password reset
│   │   └── callback/                # OAuth callback handling
│   ├── protected/
│   │   ├── profile/                 # Profile management
│   │   │   ├── page.tsx             # Profile page
│   │   │   ├── settings/            # User settings
│   │   │   └── security/            # Security settings
│   │   └── admin/
│   │       └── users/               # User management (super admin)
│   └── api/
│       ├── auth/                    # Auth API endpoints
│       └── profile/                 # Profile API endpoints
├── components/
│   ├── auth/
│   │   ├── signup-form.tsx          # Sign-up form component
│   │   ├── profile-form.tsx         # Profile editing component
│   │   └── role-selector.tsx        # Role selection during registration
│   └── profile/
│       ├── avatar-upload.tsx        # Profile image upload
│       ├── profile-card.tsx         # Profile display
│       └── settings-form.tsx        # Settings management
└── lib/
    ├── auth/
    │   ├── permission-utils.ts      # Permission checking utilities
    │   └── role-utils.ts            # Role management utilities
    └── validation/
        └── profile-schema.ts        # Profile validation schemas
```

### Guest Experience
```
src/
├── app/
│   ├── invitation/[token]/
│   │   ├── page.tsx                 # Invitation landing page
│   │   ├── accept/                  # Invitation acceptance flow
│   │   └── rsvp/                    # RSVP flow
│   └── guest/
│       ├── dashboard/               # Guest dashboard
│       ├── profile/                 # Guest profile creation & editing
│       │   ├── page.tsx             # Profile main page
│       │   ├── create/              # Profile creation flow
│       │   └── edit/                # Profile editing
│       ├── upload/                  # Photo upload interface
│       └── gallery/                 # Gallery viewing
├── components/
│   └── guest/
│       ├── profile-creation/        # Profile creation components
│       │   ├── profile-wizard.tsx   # Profile creation wizard
│       │   ├── avatar-selector.tsx  # Avatar upload/selection
│       │   └── preference-form.tsx  # Preference settings
│       └── onboarding/              # Onboarding components
│           ├── welcome-screen.tsx   # Welcome screen
│           ├── feature-tour.tsx     # Feature introduction
│           └── completion.tsx       # Onboarding completion
└── lib/
    └── guest/
        ├── profile-utils.ts         # Guest profile utilities
        └── invitation-utils.ts      # Invitation handling
```

### Organizer Moderation System
```
src/
├── app/
│   └── protected/
│       └── gallery/
│           ├── moderation/          # Moderation interface
│           │   ├── page.tsx         # Main moderation page
│           │   ├── pending/         # Pending photos view
│           │   ├── approved/        # Approved photos view
│           │   └── rejected/        # Rejected photos view
│           └── settings/            # Gallery settings
├── components/
│   ├── moderation/
│   │   ├── BatchSelectionProvider.tsx  # Batch selection context
│   │   ├── BatchActionControls.tsx     # Batch action buttons
│   │   ├── ModerationCard.tsx          # Media card with moderation
│   │   ├── ModerationStats.tsx         # Moderation statistics
│   │   ├── ModerationFilters.tsx       # Filtering controls
│   │   └── RejectionDialog.tsx         # Rejection reason dialog
│   └── gallery/
│       ├── GalleryHeader.tsx        # Gallery header with filters
│       ├── ApprovalStatusBadge.tsx  # Status indicator badge
│       └── GallerySettings.tsx      # Gallery configuration
└── lib/
    ├── moderation/
    │   ├── moderation-client.ts     # Client for moderation API
    │   └── batch-actions.ts         # Batch operation utilities
    └── gallery/
        ├── settings-utils.ts        # Gallery settings utilities
        └── permissions-utils.ts     # Gallery permissions
```

### Super Admin Tools
```
src/
├── app/
│   └── protected/
│       └── admin/
│           ├── dashboard/           # Admin dashboard
│           ├── users/               # User management
│           │   ├── page.tsx         # User listing
│           │   └── [id]/            # Single user management
│           ├── events/              # Event oversight
│           ├── analytics/           # Platform analytics
│           │   ├── page.tsx         # Main analytics page
│           │   ├── users/           # User analytics
│           │   ├── events/          # Event analytics
│           │   └── uploads/         # Upload analytics
│           └── settings/            # System settings
├── components/
│   └── admin/
│       ├── user-management/         # User management components
│       │   ├── user-table.tsx       # User listing table
│       │   ├── role-editor.tsx      # Role management
│       │   └── permission-editor.tsx # Permission assignment
│       └── analytics/               # Analytics components
│           ├── analytics-cards.tsx  # Stats dashboard cards
│           ├── user-metrics.tsx     # User metrics visualization
│           └── event-metrics.tsx    # Event metrics visualization
└── lib/
    └── admin/
        ├── user-management.ts       # User management utilities
        ├── event-oversight.ts       # Event management utilities
        └── analytics-client.ts      # Analytics data fetching
```

### Security Audit Focus
```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client initialization
│   │   ├── admin-client.ts          # Admin client with additional privileges
│   │   └── server-client.ts         # Server-side client
│   ├── auth/
│   │   ├── session-utils.ts         # Session management
│   │   ├── token-utils.ts           # Token handling
│   │   └── permission-checks.ts     # Permission verification
│   └── api/
│       ├── api-utils.ts             # API utilities
│       ├── rate-limiting.ts         # Rate limiting implementation
│       └── validation.ts            # Input validation
├── middleware.ts                    # Global middleware (auth checks)
└── app/
    └── api/
        └── [...]/
            └── route.ts             # API route handlers (all need review)
```

## Database Resources

### User Management Tables (Security Focus)
```
- users                 # User accounts
- profiles              # User profiles
- roles                 # User roles
- role_capabilities     # Role permissions
- security_audit_log    # Security event logging (to be created)
```

### Guest & Invitation Tables (Onboarding Focus)
```
- invitations           # Event invitations
- guests                # Guest profiles
- rsvps                 # RSVP responses
- gallery_permissions   # Gallery access permissions
- onboarding_progress   # Track onboarding completion (to be created)
```

### Content & Media Tables (Moderation Focus)
```
- events                # Events data
- media                 # Media items (photos/videos)
- albums                # Media collections
- moderation_logs       # Media moderation history
- moderation_queues     # Organizes media for moderation (to be created)
```

## API Endpoints (Security Audit Focus)

### Authentication & Profile APIs
```
- /api/auth/register          # New user registration
- /api/auth/login             # User authentication
- /api/profile/update         # Profile updates
- /api/profile/permissions    # Permission management
```

### Guest Experience APIs
```
- /api/invitation/validate    # Validate invitation tokens
- /api/guest/profile/create   # Guest profile creation
- /api/guest/profile/update   # Guest profile updates
- /api/guest/preferences      # Guest preference management
```

### Moderation APIs
```
- /api/media/approve          # Approve media items
- /api/media/reject           # Reject media items
- /api/media/batch-approve    # Batch approval
- /api/media/batch-reject     # Batch rejection
- /api/media/moderation-stats # Moderation statistics
```

### Admin APIs
```
- /api/admin/users            # User management
- /api/admin/events           # Event oversight
- /api/admin/analytics        # Analytics data
- /api/admin/audit-log        # Security audit logging
```

## Security Vulnerabilities (Initial Assessment)

### GitHub Code Scanning Alert
- **Location**: To be identified from GitHub security alerts
- **Issue Type**: Likely related to data validation or authentication
- **Severity**: To be assessed
- **Recommended Approach**: Review GitHub alert details, identify affected code, develop and test fix without disrupting functionality

### Permission Policy Verification
```
- RLS Policies              # Review all Row Level Security policies
- API Endpoint Security     # Verify proper auth checks on all endpoints
- Client-Side Permissions   # Ensure UI properly reflects permissions
- Cross-User Data Access    # Verify data isolation between users
```

## Implementation Notes (April 22, 2025)

### Critical Issues to Address
- **Super Admin Dashboard**: Fix data aggregation to show information from all organizers
- **Organizer Profile**: Resolve issue with profile settings not saving properly
- **Permission Policies**: Verify proper enforcement for profile and gallery settings updates
- **Security Alert**: Address GitHub code scanning alert (details to be reviewed)

### Guest Onboarding Flow QA Focus Areas
- Complete profile creation process testing
- Verify all validation rules are properly enforced
- Test edge cases in the invitation acceptance flow
- Ensure consistent error messaging and recovery paths
- Validate preference settings are correctly saved and applied

### Organizer Registration Process Focus Areas
- Test end-to-end registration flow for new organizers
- Verify proper role assignment and permission setup
- Ensure profile completion is guided and validated
- Test event creation capabilities for new accounts
- Verify proper isolation between organizer accounts

### Moderation System Verification
- Test batch selection and moderation for large media collections
- Verify moderation statistics update correctly
- Ensure proper status tracking for all media items
- Test performance with high-volume queues
- Verify notification system for moderation actions

This resource map provides an overview of the key files and structures that will need to be modified during Session 44. It serves as a reference point for navigating the codebase efficiently and focusing on the critical aspects of user experience refinement, security auditing, and moderation system finalization. 