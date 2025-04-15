# Resource Directories Map for Session 42
# April 15, 2025
# Focus: Guest Profile Creation & RSVP Flow Completion

## Key Focus Areas

- **RSVP System Repair**
  - `src/app/api/rsvp/submit/route.ts` - RSVP submission handler
  - `src/lib/supabase/rsvp.ts` - RSVP database operations
  - `src/components/rsvp/rsvp-form.tsx` - RSVP form component
  - `src/lib/validations/rsvp-schema.ts` - RSVP validation schema

- **Profile Creation Fix**
  - `src/app/guest/profile/page.tsx` - Guest profile page
  - `src/components/guest/profile-form.tsx` - Profile form component
  - `src/lib/supabase/guests.ts` - Guest database operations
  - `src/lib/validations/profile-schema.ts` - Profile validation schema
  - `src/app/api/guest/profile/route.ts` - Profile API endpoint

- **Dashboard Entry Control**
  - `src/app/guest/dashboard/page.tsx` - Guest dashboard page
  - `src/components/guest/dashboard/profile-checker.tsx` - Profile validation component
  - `src/middleware.ts` - Update for guest profile validation
  - `src/lib/hooks/useGuestProfile.ts` - Guest profile data hook

- **Database Schema Alignment**
  - `supabase/migrations/` - Migration files
  - `src/types/supabase.ts` - TypeScript definitions for database
  - `src/lib/helpers/data-mappers.ts` - Create for field mapping functions
  - `src/lib/utils/validation.ts` - Enhanced validation utilities

## Critical Files to Fix

1. `src/app/api/rsvp/submit/route.ts` - Fix RSVP submission with proper column names and guest profile creation
   - Add proper error handling
   - Fix column naming inconsistencies
   - Use handle_guest_profile function
   - Add detailed logging

2. `src/app/guest/profile/page.tsx` - Fix profile creation page
   - Fix form field validation
   - Handle token properly
   - Add error recovery UI
   - Fix submission process

3. `src/app/guest/dashboard/page.tsx` - Update dashboard access control
   - Add profile existence check
   - Create redirect for incomplete profiles
   - Fix data loading with proper guest ID
   - Enhance error states

4. `src/lib/supabase/guests.ts` - Fix guest database operations
   - Add proper field mapping
   - Fix constraint handling
   - Implement better error messaging
   - Update TypeScript interfaces

5. `src/middleware.ts` - Enhance for guest profile validation
   - Add guest profile verification
   - Create redirection logic for incomplete profiles
   - Improve token handling
   - Add detailed logging

## Database Tables & Relations

- **Core Tables**
  - `profiles` - User profiles with subscription status constraint
  - `guests` - Guest profiles (needs fixed constraints)
  - `rsvps` - RSVP submissions (column naming issues)
  - `event_attendees` - Event attendance records
  - `invitations` - Invitation records and tokens
  - `events` - Event details

- **Relations**
  - `guests -> invitations` - Guest tied to invitation by invitation_id
  - `guests -> profiles` - Guest may have an associated profile
  - `rsvps -> invitations` - RSVP tied to invitation by invitation_id
  - `event_attendees -> events` - Attendees connected to events

## Key Components to Create/Modify

1. **Database Column Mapper Utils**
   - `src/lib/helpers/data-mappers.ts` - Create utilities for mapping form fields to database columns
   - Implement functions to handle naming inconsistencies
   - Add validation for required fields
   - Create default value providers

2. **Profile Validation Guards**
   - `src/components/guest/profile-validator.tsx` - Create component to validate profile existence
   - Add loading states during validation
   - Create helpful error messages
   - Implement recovery options

3. **Enhanced Error Components**
   - `src/components/ui/error-card.tsx` - Improve error display with recovery options
   - Add specific error messages for common issues
   - Implement retry functionality
   - Create support contact option

4. **Form Field Validation Utils**
   - `src/lib/validations/form-utils.ts` - Enhance validation with database constraint awareness
   - Add real-time validation for critical fields
   - Create feedback for constraint requirements
   - Implement validation against actual database constraints

## Implementation Phases

1. **Diagnostic Phase**
   - Run SQL queries to verify table structures
   - Identify constraint requirements for profiles
   - Trace data flow from RSVP to profile creation
   - Check actual column names against code references

2. **Schema Alignment Phase**
   - Update TypeScript interfaces
   - Create field mapping utilities
   - Fix code references to match actual schema
   - Add migration scripts if needed

3. **RSVP Fix Phase**
   - Update RSVP submission handler
   - Fix column references
   - Add proper error handling
   - Implement handle_guest_profile usage

4. **Profile Creation Fix Phase**
   - Update profile form to match constraints
   - Add proper validation for required fields
   - Fix submission process
   - Add error recovery UI

5. **Dashboard Control Phase**
   - Add profile existence validation
   - Create redirection for incomplete profiles
   - Fix data loading with proper IDs
   - Enhance error states

6. **Testing & Validation Phase**
   - Test complete guest journey
   - Verify data integrity
   - Check all edge cases
   - Document final flow

## Utility Libraries

- **Form Handling**
  - `react-hook-form` - Form state management
  - `zod` - Schema validation
  - `@hookform/resolvers` - Form validation resolvers

- **Database**
  - `@supabase/supabase-js` - Supabase client
  - `postgres` - Direct PostgreSQL queries for testing

- **State Management**
  - `zustand` - State management
  - `@tanstack/react-query` - Server state management

- **UI**
  - `@/components/ui` - Core UI components
  - `@radix-ui/react-alert-dialog` - Alert dialogs for errors
  - `@radix-ui/react-toast` - Toast messages for feedback

## Testing Resources

- **Testing Utilities**
  - `src/lib/test-utils/form-testing.ts` - Form testing utilities
  - `src/lib/test-utils/profile-testing.ts` - Profile testing utilities
  - `src/lib/test-utils/rsvp-testing.ts` - RSVP testing utilities

- **Test Cases**
  - `cypress/e2e/guest-journey.cy.ts` - End-to-end guest journey test
  - `__tests__/rsvp/submit.test.ts` - RSVP submission tests
  - `__tests__/guest/profile.test.ts` - Profile creation tests

## Documentation

- **Development Documentation**
  - `docs/development/session_42_kickoff_narrative.md` - Session kickoff
  - `docs/development/session_42_checklist.md` - Implementation checklist
  - `docs/database/constraints.md` - Database constraints documentation

- **User Flow Documentation**
  - `docs/user-flows/guest-journey.md` - Complete guest journey
  - `docs/user-flows/rsvp-flow.md` - RSVP process flow
  - `docs/user-flows/profile-creation.md` - Profile creation flow

## Key SQL Queries for Debugging

```sql
-- Check profiles table constraints
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'profiles' AND nsp.nspname = 'public';

-- Check column names in guests table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'guests';

-- Check column names in rsvps table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'rsvps';

-- Check existing guest records for a specific invitation
SELECT * FROM guests WHERE invitation_id = 'your-invitation-id';

-- Test handle_guest_profile function
SELECT handle_guest_profile('test-email@example.com', 'Test User', 'your-invitation-id');
``` 