# RSVP System Directory Structure Map

The following diagram provides a comprehensive visual representation of the Cloud Burst project's file structure as it relates to the RSVP system implementation for Session 37.

```
cloud-burst/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── magic-link/
│   │   │   │       └── route.ts                   # Magic link authentication API
│   │   │   ├── invitations/
│   │   │   │   ├── [token]/
│   │   │   │   │   └── route.ts                   # Token validation API
│   │   │   │   ├── respond/
│   │   │   │   │   └── route.ts                   # RSVP submission API
│   │   │   │   └── status/
│   │   │   │       └── route.ts                   # RSVP status check API
│   │   │   └── analytics/
│   │   │       └── rsvp/
│   │   │           └── route.ts                   # RSVP analytics tracking API
│   │   ├── invitation/
│   │   │   └── [token]/
│   │   │       ├── page.tsx                       # Public invitation landing page
│   │   │       ├── layout.tsx                     # Invitation page layout
│   │   │       ├── loading.tsx                    # Loading state component
│   │   │       ├── error.tsx                      # Error handling component
│   │   │       └── not-found.tsx                  # Invalid token handling
│   │   └── dashboard/
│   │       └── events/
│   │           └── [id]/
│   │               └── invitations/
│   │                   └── page.tsx               # Dashboard invitation management
│   ├── components/
│   │   ├── invitations/
│   │   │   ├── rsvp-form.tsx                      # RSVP form component
│   │   │   ├── invitation-details.tsx             # Invitation details display
│   │   │   ├── response-confirmation.tsx          # Confirmation component
│   │   │   ├── plus-one-form.tsx                  # Plus-one guest form
│   │   │   ├── dietary-preferences.tsx            # Dietary preferences form
│   │   │   └── event-card.tsx                     # Event card for invitation page
│   │   ├── auth/
│   │   │   ├── magic-link-auth.tsx                # Magic link authentication component
│   │   │   └── guest-session.tsx                  # Guest session management
│   │   └── ui/
│   │       ├── form/                              # Reusable form components
│   │       └── invitation/                        # UI components for invitations
│   ├── lib/
│   │   ├── invitations/
│   │   │   ├── token.ts                           # Token validation utilities
│   │   │   ├── types.ts                           # Invitation type definitions
│   │   │   ├── schema.ts                          # Zod validation schemas
│   │   │   └── utils.ts                           # Invitation utilities
│   │   ├── email/
│   │   │   ├── templates/
│   │   │   │   ├── rsvp-confirmation.ts           # RSVP confirmation email
│   │   │   │   └── invitation-reminder.ts         # Invitation reminder email
│   │   │   └── send.ts                            # Email sending utilities
│   │   ├── supabase/
│   │   │   ├── invitations.server.ts              # Server-side invitation functions
│   │   │   ├── auth.server.ts                     # Server-side auth functions
│   │   │   └── schema.ts                          # Database schema types
│   │   └── analytics/
│   │       └── invitation.ts                      # Invitation analytics utilities
│   ├── hooks/
│   │   ├── use-invitation.ts                      # Invitation data hook
│   │   ├── use-rsvp-form.ts                       # RSVP form hook
│   │   └── use-magic-link.ts                      # Magic link authentication hook
│   └── utils/
│       ├── date-formatting.ts                     # Date formatting utilities
│       └── validation.ts                          # Input validation utilities
├── public/
│   └── images/
│       └── invitation/
│           ├── backgrounds/                       # Invitation background images
│           └── icons/                             # RSVP-related icons
└── docs/
    ├── development/
    │   ├── session_37_checklist.md                # Session 37 implementation checklist
    │   ├── session_37_kickoff_prompt.md           # Session 37 kickoff prompt
    │   ├── session_37_resources.md                # Session 37 resources document
    │   ├── session_37_directory_map.md            # This directory map file
    │   └── invitation_system_design.md            # RSVP system design document
    └── api/
        └── invitations.md                         # Invitation API documentation
```

## Key Development Areas

The RSVP system implementation in Session 37 will focus on creating and integrating the following key areas:

### 1. Public Invitation Landing Page
- Route implementation with token validation
- Responsive design for all device sizes
- Event details display
- RSVP form integration

### 2. RSVP Form Component
- Form validation using Zod
- Attendance selection (accepting/declining)
- Plus-one guest information
- Dietary restrictions and additional notes

### 3. Magic Link Authentication
- Email verification for guests
- Session management for invited users
- Secure token validation

### 4. API Endpoints
- Token validation endpoint
- RSVP submission endpoint
- Analytics tracking endpoint

### 5. Email Notifications
- RSVP confirmation emails
- Reminder emails for pending invitations

### 6. Database Integration
- Supabase RLS policies for secure access
- Data models and schemas
- Server-side functions for data operations

## Required New Files

The following new files need to be created during Session 37:

1. `src/app/invitation/[token]/page.tsx` - Public invitation landing page
2. `src/app/invitation/[token]/layout.tsx` - Invitation page layout
3. `src/app/api/invitations/[token]/route.ts` - Token validation API
4. `src/app/api/invitations/respond/route.ts` - RSVP submission API
5. `src/components/invitations/rsvp-form.tsx` - RSVP form component
6. `src/components/invitations/response-confirmation.tsx` - Confirmation component
7. `src/lib/invitations/token.ts` - Token validation utilities
8. `src/lib/invitations/schema.ts` - Zod validation schemas
9. `src/hooks/use-invitation.ts` - Invitation data hook
10. `src/lib/email/templates/rsvp-confirmation.ts` - Email template

## Integration Points

The RSVP system will integrate with existing components and systems:

1. **Authentication System**: For magic link authentication
2. **Email Service**: For sending invitation and confirmation emails
3. **Analytics Dashboard**: For tracking RSVP responses
4. **Events Database**: For accessing event details
5. **User Profiles**: For organizer information 