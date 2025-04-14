# Resource Directories Map for Session 41-B
# April 16, 2025
# Focus: Token Management & Navigation Flow

## Key Focus Areas

- **Token Management Service**
  - `src/lib/tokens/invitation-token.ts` - Token management utility (to be created)
  - `src/lib/tokens/index.ts` - Token module exports
  - `src/lib/supabase/invitations.ts` - Invitation database operations
  - `src/lib/utils/validation.ts` - Token validation helpers

- **Guest Profile Enhancement**
  - `src/app/guest/profile/page.tsx` - Guest profile setup page
  - `src/components/guest/GuestProfileForm.tsx` - Profile form component
  - `src/components/guest/TokenRequestForm.tsx` - Fallback form for missing tokens
  - `src/components/guest/ProfileErrorState.tsx` - Error handling components

- **Guest Dashboard Implementation**
  - `src/app/guest/dashboard/page.tsx` - Guest dashboard landing page
  - `src/components/guest/dashboard/WelcomePanel.tsx` - Personalized welcome component
  - `src/components/guest/dashboard/EventContext.tsx` - Event context display
  - `src/components/guest/dashboard/NavigationCards.tsx` - Feature navigation cards

- **Navigation Flow**
  - `src/middleware.ts` - Authentication middleware
  - `src/lib/hooks/useTokenNavigation.ts` - Navigation hook with token context
  - `src/app/guest/layout.tsx` - Guest section layout with auth checking
  - `src/components/layout/GuestAuthWrapper.tsx` - Auth wrapper component

## State Management

- **Token State**
  - `src/lib/store/tokenStore.ts` - Token state management with Zustand
  - `src/lib/hooks/useToken.ts` - Token access hook
  - `src/lib/providers/TokenProvider.tsx` - Token context provider

- **Guest Data State**
  - `src/lib/hooks/useGuestData.ts` - Guest profile data fetching hook
  - `src/lib/hooks/useInvitation.ts` - Invitation data fetching hook
  - `src/lib/api/guest.ts` - Guest API client utilities

## Database Tables

- **Core Tables**
  - `rsvps` - Stores RSVP status and metadata
  - `guests` - Stores guest profile information
  - `events` - Stores event details and counts
  - `invitations` - Stores invitation tokens and statuses
  - `analytics_events` - Stores analytics data for RSVPs and invitations

## Error Handling

- **Error Components**
  - `src/components/guest/ErrorState.tsx` - Error display components
  - `src/components/guest/TokenErrorState.tsx` - Token-specific error states
  - `src/components/ui/ErrorCard.tsx` - Error card component

- **Error Utilities**
  - `src/lib/utils/error-handling.ts` - Error handling utilities
  - `src/lib/utils/error-messages.ts` - User-friendly error messages
  - `src/lib/hooks/useErrorHandling.ts` - Error handling hook

## Testing Utilities

- **Token Testing**
  - `tests/utils/token-testing.ts` - Token testing utilities
  - `tests/hooks/useToken.test.ts` - Token hook tests
  - `tests/api/token-validation.test.ts` - Token validation tests

- **Navigation Testing**
  - `tests/integration/guest-journey.test.ts` - End-to-end guest journey tests
  - `tests/hooks/useTokenNavigation.test.ts` - Navigation hook tests
  - `tests/components/GuestAuthWrapper.test.ts` - Auth wrapper tests

## Implementation Steps

1. **Create Token Management Infrastructure**:
   - Create tokens directory structure
   - Implement token utility with storage and retrieval
   - Add token validation against database
   - Create error handling for token issues

2. **Enhance Profile Page**:
   - Update to use token management service
   - Add error handling for token issues
   - Implement token-aware profile form
   - Add fallback for missing tokens
   - Fix navigation to dashboard

3. **Implement Guest Dashboard**:
   - Create or enhance dashboard page
   - Add token-based authentication
   - Show personalized content
   - Create feature navigation components
   - Implement error handling

4. **Refine Navigation Flow**:
   - Update middleware for token awareness
   - Add loading states during navigation
   - Ensure token persistence
   - Implement error recovery
   - Fix state transfer between pages

## Key Files to Modify

1. `src/lib/tokens/invitation-token.ts` (Create) - Token management service
2. `src/app/guest/profile/page.tsx` - Profile page with token handling
3. `src/app/guest/dashboard/page.tsx` - Dashboard with token authentication
4. `src/components/guest/GuestProfileForm.tsx` - Update form submission
5. `src/lib/supabase/guests.ts` - Guest data operations
6. `src/lib/supabase/invitations.ts` - Invitation validation
7. `src/middleware.ts` - Update auth middleware for token awareness
8. `src/app/guest/layout.tsx` - Guest section layout with auth checking

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