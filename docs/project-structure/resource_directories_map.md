# Resource Directories Map for Session 41

## Key Focus Areas

- **Invitation & RSVP System**
  - `src/app/event/[slug]/confirmed/` - RSVP confirmation pages
  - `src/app/invitation/` - Invitation management
  - `src/components/invitation/` - Invitation components
  - `src/lib/supabase/rsvp.ts` - RSVP database operations

- **Guest Profile & Onboarding**
  - `src/app/guest/profile/` - Guest profile setup
  - `src/app/guest/dashboard/` - Guest dashboard (destination)
  - `src/components/guest/` - Guest-specific components
  - `src/components/onboarding/` - Onboarding flow components

- **Token Management**
  - `src/lib/tokens/` - Token handling utilities (to be created)
  - `src/lib/supabase/invitations.ts` - Invitation database operations
  - `src/middleware.ts` - Authentication and route protection

- **Database Operations**
  - `src/lib/supabase/` - Supabase client and operations
  - `src/lib/db/schema/` - Database schema definitions
  - `src/lib/validation/` - Zod schema validation

## Relevant Component Directories

- **UI Components**
  - `src/components/ui/` - Core UI components
  - `src/components/forms/` - Form components for invitations

- **Navigation Components**
  - `src/components/layout/` - Layout components
  - `src/components/navigation/` - Navigation components
  - `src/app/layout.tsx` - Root layout

- **Gallery Components**
  - `src/components/gallery/` - Gallery display components
  - `src/app/gallery/` - Gallery pages

## Database Tables

- **Core Tables**
  - `rsvps` - Stores RSVP status and metadata
  - `guests` - Stores guest profile information
  - `events` - Stores event details and counts
  - `invitations` - Stores invitation tokens and statuses

## Utility Libraries

- **Form Handling**
  - `react-hook-form` - Form state management
  - `zod` - Schema validation

- **Authentication**
  - `@supabase/auth-js` - Authentication utilities
  - `@supabase/supabase-js` - Supabase client

- **State Management**
  - `zustand` - State management
  - `@tanstack/react-query` - Server state management

- **Navigation**
  - `next/navigation` - Next.js navigation utilities

## Testing Resources

- **Unit Tests**
  - `tests/unit/invitation/` - Invitation system tests
  - `tests/unit/rsvp/` - RSVP system tests

- **Integration Tests**
  - `tests/integration/guest-flow/` - End-to-end guest journey tests
  - `tests/integration/token-handling/` - Token persistence tests

## Documentation

- **Development Guides**
  - `docs/development/session_41_kickoff.md` - Session kickoff
  - `docs/development/invitation_flow.md` - Invitation flow documentation

- **Database Schema**
  - `docs/database/schema.md` - Database schema documentation
  - `docs/database/relationships.md` - Table relationships

## Key Files to Modify

1. `/src/app/event/[slug]/confirmed/page.tsx` - Fix RSVP confirmation and database entry
2. `/src/app/guest/profile/page.tsx` - Add token persistence and validation
3. `/src/app/guest/dashboard/page.tsx` - Implement proper landing page after setup
4. `/src/lib/tokens/invitation-token.ts` - Create token management service
5. `/src/middleware.ts` - Add token validation middleware
6. `/src/lib/supabase/rsvp.ts` - Fix RSVP database operations 