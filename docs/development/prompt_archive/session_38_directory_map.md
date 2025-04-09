# Session 38: Directory Map

This document provides a directory structure map for the Public Invitation & RSVP System implementation in Session 38. Use this as a reference when creating new files and organizing components.

## 📁 Directory Structure

```
src/
├── app/
│   ├── api/
│   │   ├── invitations/
│   │   │   ├── [token]/
│   │   │   │   └── route.ts                 # API endpoint for specific invitation details
│   │   │   ├── respond/
│   │   │   │   └── route.ts                 # API endpoint for RSVP responses
│   │   │   └── validate/
│   │   │       └── route.ts                 # API endpoint for token validation
│   │   └── auth/
│   │       └── magic-link/
│   │           └── route.ts                 # API endpoint for magic link authentication
│   ├── invitation/
│   │   └── [token]/
│   │       ├── page.tsx                     # Public invitation landing page
│   │       ├── loading.tsx                  # Loading state for invitation page
│   │       ├── error.tsx                    # Error state for invalid tokens
│   │       └── not-found.tsx                # Not found state for expired invitations
│   └── rsvp/
│       ├── success/
│       │   └── page.tsx                     # RSVP success confirmation page
│       └── declined/
│           └── page.tsx                     # RSVP declined confirmation page
├── components/
│   ├── invitation/
│   │   ├── invitation-hero.tsx              # Hero section for invitation page
│   │   ├── event-details-card.tsx           # Event details display component
│   │   ├── rsvp-form.tsx                    # Main RSVP form component
│   │   ├── plus-one-fields.tsx              # Plus one form fields
│   │   ├── dietary-restrictions-field.tsx   # Dietary restrictions input
│   │   ├── form-success.tsx                 # Success confirmation component
│   │   ├── form-declined.tsx                # Declined confirmation component
│   │   └── add-to-calendar.tsx              # Add to calendar button component
│   └── email/
│       ├── rsvp-confirmation-template.tsx   # Email template for RSVP confirmation
│       └── magic-link-template.tsx          # Email template for magic links
├── lib/
│   ├── validations/
│   │   └── rsvp-schema.ts                   # Zod schema for RSVP form validation
│   ├── invitations/
│   │   ├── token-utils.ts                   # Utilities for token generation and validation
│   │   └── rsvp-service.ts                  # Service functions for RSVP management
│   └── email/
│       └── templates.ts                     # Email template configuration
├── hooks/
│   ├── use-invitation.ts                    # Hook for invitation data fetching
│   ├── use-rsvp-form.ts                     # Hook for RSVP form state management
│   └── use-magic-link.ts                    # Hook for magic link authentication
└── types/
    ├── invitation.ts                        # Types for invitation data
    └── rsvp.ts                              # Types for RSVP form data
```

## 🔄 Component Hierarchy

```
InvitationPage
├── InvitationHero
├── EventDetailsCard
│   └── AddToCalendar
└── RSVPForm
    ├── AttendanceSelection
    ├── PlusOneFields
    ├── DietaryRestrictionsField
    ├── NotesField
    └── SubmitButton

SuccessPage
└── FormSuccess
    ├── EventDetails
    ├── ResponseSummary
    └── ShareOptions

DeclinedPage
└── FormDeclined
    ├── EventDetails
    └── ResponseSummary
```

## 🌐 API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/invitations/[token]` | GET | Get invitation details by token | None |
| `/api/invitations/validate` | POST | Validate an invitation token | None |
| `/api/invitations/respond` | POST | Submit RSVP response | None |
| `/api/auth/magic-link` | POST | Request magic link for authentication | None |

## 🔐 Database Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `invitations` | Stores invitation data | `id`, `token`, `email`, `name`, `event_id`, `status`, `expires_at` |
| `rsvp_responses` | Stores RSVP responses | `id`, `invitation_id`, `status`, `plus_one`, `dietary_restrictions`, `notes` |
| `plus_ones` | Stores plus one guest data | `id`, `rsvp_id`, `name`, `email`, `dietary_restrictions` |

## 📊 State Management

| State | Location | Description |
|-------|----------|-------------|
| Invitation Data | `useInvitation` hook | Invitation details fetched by token |
| RSVP Form | `useRSVPForm` hook | Form state, validation, and submission |
| Magic Link | `useMagicLink` hook | Magic link request and verification |
| Toast Notifications | Toast component | Success/error notifications |
| Loading States | Component state | Component-level loading indicators |

## 🧪 Test Files

| Test | Description |
|------|-------------|
| `invitation-page.test.tsx` | Tests for the invitation landing page |
| `rsvp-form.test.tsx` | Tests for the RSVP form component |
| `token-utils.test.ts` | Tests for token utilities |
| `rsvp-schema.test.ts` | Tests for Zod schema validation |
| `api-endpoints.test.ts` | Tests for API endpoints | 