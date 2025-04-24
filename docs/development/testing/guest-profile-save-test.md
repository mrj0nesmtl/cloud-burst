# Guest Profile Save Functionality Test Plan

## Overview
This document outlines the testing procedure for verifying that guest profile information is properly saved to the Supabase database.

## Test Environment
- Test account: Used in the Supabase table exports (e.g., Sara Jane with email joel.yaffe+sarajane@gmail.com)
- Test event: Event with ID `4ee633f4-3407-4280-9c1e-8551c94ab161`
- Access token: `fdd2c85e-d0c8-4d74-9274-75d57aa08a23`

## Code Analysis
Based on our code review, we discovered:

1. The guest profile page (`/src/app/guest/profile/page.tsx`) uses a form that saves data directly to the `guests` table in Supabase.

2. The `GuestProfileForm` component at `/src/components/guest/GuestProfileForm.tsx` attempts to update both the `event_attendees` table and `profiles` table, which appears to be incorrect based on our database structure analysis.

3. The issue is that we have redundant tables (`guests` and `event_attendees`) that contain similar data. For our test, we will focus on ensuring data is correctly saved to the `guests` table.

## Test Steps

### 1. Initial Verification
1. Access the guest database entry for Sara Jane in the Supabase dashboard
2. Note the current values for:
   - Name
   - Email
   - Phone
   - Notes
   - Avatar URL

### 2. Access the Guest Profile Page
1. Navigate to the guest profile page with the token:
   `/guest/profile?token=fdd2c85e-d0c8-4d74-9274-75d57aa08a23`
2. Verify the form loads with the current guest data

### 3. Update Profile Information
1. Modify the name field (e.g., change to "Sara Jane Test")
2. Add or update phone number (e.g., "555-123-4567")
3. Add a note in the notes field
4. Upload a test avatar image (if available)

### 4. Submit the Form
1. Click the "Save Profile" button
2. Observe the loading state and response message
3. Note any console errors that appear

### 5. Verify Database Update
1. Return to the Supabase dashboard
2. Check the `guests` table entry for Sara Jane
3. Verify the following fields have been updated:
   - Name field shows "Sara Jane Test"
   - Phone field shows "555-123-4567"
   - Notes field shows the test note
   - Avatar URL is updated (if an image was uploaded)
   - `updated_at` timestamp has been updated

### 6. Test Data Persistence
1. Refresh the guest profile page
2. Verify that the form loads with the newly updated data
3. Navigate away and return to the page to confirm data persistence

## Expected Results
- The profile data should be saved correctly to the `guests` table
- No errors should appear in the console
- A success toast notification should appear after submission
- The updated data should persist when revisiting the page

## Bug Identification
- Note any discrepancies between expected and actual behavior
- Document any console errors
- Check for issues related to database schema inconsistencies (between `guests` and `event_attendees` tables)

## Recommendations
If the test reveals issues with the conflicting tables strategy:
1. Consider consolidating the data model to use only the `guests` table
2. Update the `GuestProfileForm` component to remove references to the `event_attendees` table
3. Ensure consistent data structure and field naming across the application

## Next Steps
After verifying the profile save functionality:
1. Update documentation to clarify the correct data flow
2. Consider adding database migrations to consolidate the redundant tables
3. Implement code fixes if needed 