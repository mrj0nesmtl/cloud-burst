# Cloud Burst: Invitation System Testing Plan

## Overview
📅 *Last Updated: March 27, 2025*  
📊 *Version: 0.8.2*

This document outlines the complete testing workflow for Cloud Burst's invitation system, specifically focusing on event creation, invitation delivery through SendGrid, guest authentication, QR code scanning, gallery access functionality, API endpoint security, form validation, and Next.js 14 App Router architecture implementation.

## Prerequisites
- Access to a Cloud Burst organizer account
- At least one test email account to receive invitations
- A device with a camera for QR code scanning
- Ideally a second device to display QR codes for testing
- Access to SendGrid dashboard for delivery verification
- API testing tools (like Postman) for endpoint validation
- Testing environment with Next.js 14 App Router configuration

## Testing Workflow

### Phase 1: Event Creation
1. Log in to your Cloud Burst organizer account
2. Navigate to the dashboard and click "Create Event"
3. Complete the event form with:
   - Event name
   - Date and time
   - Location details
   - Event description
   - Privacy settings
4. **Expected outcome**: New event appears in your events list and dashboard statistics update

### Phase 2: Gallery and QR Code Verification
1. Select the newly created event from your events list
2. Navigate to the "QR Codes" tab
3. Verify the event gallery QR code has been generated
4. Test the regeneration feature if changes are made to event details
5. **Expected outcome**: QR code displayed with proper event attribution and regeneration works correctly

### Phase 3: Invitation Creation and Delivery
1. Navigate to "Invitations" section for your event
2. Test Single Invitation Path:
   - Select "Create Invitation"
   - Enter recipient email address
   - Add an optional custom message
   - Select appropriate email template
   - Verify form validation for email format
   - Submit the invitation
3. Test Bulk Invitation Path:
   - Select "Bulk Invitations"
   - Upload CSV file with test email addresses
   - Select appropriate email template
   - Verify validation of CSV format and contents
   - Submit the bulk invitations
4. **Expected outcome**: 
   - Confirmation message appears with success/error information
   - Invitation appears in the event's invitation list with "Pending" status
   - Backend logs show successful API calls to invitation endpoints
   - SendGrid dashboard shows queued/sent emails
   - Form validation correctly identifies invalid inputs
   - Error handling appropriately manages any issues

### Phase 4: API Endpoint Security Testing
1. Use API testing tools to attempt accessing invitation endpoints:
   - Test authenticated endpoints without proper credentials
   - Test rate limiting by making repeated requests
   - Attempt to create invitations with malformed data
   - Test permission boundaries by using different user roles
2. **Expected outcome**:
   - Unauthorized requests are properly rejected
   - Rate limiting prevents excessive requests
   - Malformed data is rejected with appropriate error messages
   - Permissions are correctly enforced based on user roles

### Phase 5: Email Delivery Verification
1. Access the SendGrid dashboard
2. Verify email delivery statistics for test invitations
3. Check for any delivery failures or bounces
4. Access the test email account and locate the invitation email
5. Verify the email contains:
   - Magic login link
   - Event details (name, date, location)
   - RSVP options
   - Properly rendered QR code
   - Fallback authentication link (if magic link fails)
   - All branding elements and formatting are correct
6. **Expected outcome**: 
   - All emails show as delivered in SendGrid dashboard
   - Emails contain all required elements and are properly formatted
   - Tracking data is recorded for email opens and clicks

### Phase 6: Guest Authentication Testing
1. Click the magic link in the invitation email
2. **Expected outcome**: 
   - Automatic authentication without password entry
   - Redirection to the event gallery
   - Invitation status updates to "Used" in organizer dashboard
   - Appropriate session cookies are set
   - API request logs show successful authentication

### Phase 7: QR Code Authentication Testing
1. From the invitation email, access and display the invitation QR code on a device
2. On a separate device logged in with an organizer account:
   - Navigate to QR scanner page
   - Scan the displayed invitation QR code
3. Test error scenarios:
   - Try scanning an expired QR code
   - Test scanning in poor lighting conditions
   - Attempt scanning with invalid QR codes
4. **Expected outcome**:
   - Valid QR code successfully scanned
   - Guest information displayed
   - Invitation marked as "Confirmed" in system
   - Error states are handled gracefully with user feedback
   - Error recovery mechanisms allow for retrying failed scans

### Phase 8: Guest Account Functionality
1. Access the system as an authenticated guest
2. Test the following features:
   - Gallery browsing
   - Photo viewing
   - RSVP status changes
   - Photo uploading (if enabled)
   - User guidance elements
3. **Expected outcome**: 
   - Guest can perform all allowed actions with appropriate permissions
   - User guidance information is displayed in relevant contexts
   - Any errors are presented with helpful recovery options

### Phase 9: RSVP Functionality
1. As a guest user, locate RSVP options
2. Test changing RSVP status (Yes/No/Maybe)
3. Submit changes
4. **Expected outcome**:
   - RSVP status updates in real-time
   - Changes reflect in organizer dashboard
   - Notification sent to organizer via SendGrid (if configured)
   - API endpoints correctly process the RSVP status change

### Phase 10: Email Template Testing
1. As an admin or organizer, access the template management interface
2. Test modifying existing templates
3. Preview the templates with test data
4. Synchronize the template changes with SendGrid
5. Send a test invitation using the modified template
6. **Expected outcome**:
   - Template changes are reflected in SendGrid
   - Test invitation uses the updated template
   - Template variables are correctly replaced with actual content
   - Synchronization logs show successful API calls

### Phase 11: Error Handling and Form Validation
1. Test form validation by deliberately entering:
   - Invalid email addresses
   - Empty required fields
   - Special characters in input fields
   - Extremely long input values
2. Test error handling by:
   - Submitting forms with network disconnected
   - Sending invitations to already invited users
   - Uploading improperly formatted CSV files
   - Using expired authentication tokens
3. **Expected outcome**:
   - Validation errors are displayed clearly and specifically
   - Form highlights problematic fields
   - Helpful guidance provided for fixing errors
   - Error recovery mechanisms allow for correction and resubmission
   - Backend logs show appropriate error handling

### Phase 12: Next.js App Router Architecture Testing
1. Test the client/server component separation:
   - Verify all interactive components are marked with "use client" directive
   - Confirm server components are properly handling data fetching
   - Test that client components don't unnecessarily fetch data in the browser
2. Test authentication flow in gallery pages:
   - Verify the session is properly maintained when navigating between pages
   - Test authentication status is correctly checked on both client and server
   - Confirm protected routes correctly redirect unauthorized users
3. Test type mapping between database and UI:
   - Verify that data from database is correctly mapped to UI components
   - Ensure enums and other type definitions are consistently used
   - Check that form submissions correctly map UI data back to database types
4. Test server-side data fetching:
   - Verify appropriate use of server actions when needed
   - Confirm data loading states display correctly
   - Test error handling during server-side data fetching
5. **Expected outcome**:
   - No hydration errors in the console
   - Authentication state is consistent throughout the application
   - Type-safe operations without runtime type errors
   - Optimized data fetching with minimal client-side requests
   - Proper error boundaries catch and display issues gracefully

## Error Handling Verification
Throughout testing, verify these error scenarios:
- Invalid email address handling (immediate form validation)
- Expired invitation link behavior (clear error message with renewal option)
- Invitation to already registered user (smart merge of accounts)
- QR code scanning with poor lighting/angles (retry guidance)
- Network interruption during authentication (recovery options)
- API rate limiting (clear feedback on waiting period)
- SendGrid delivery failures (retry mechanism and notification)
- Permission boundary violations (clear explanation of limitations)
- Hydration errors from mismatched client/server rendering (should be none)
- Authentication flow interruptions (proper recovery and retry)
- Type mismatches between UI and database (proper validation and correction)

## Bug Reporting Format
When reporting issues, please include:
1. Testing phase where issue occurred
2. Steps to reproduce
3. Expected vs. actual outcome
4. Screenshots (if applicable)
5. Device/browser information
6. API response details (if applicable)
7. SendGrid error codes (if related to email delivery)
8. React component stack trace (if related to rendering issues)
9. Next.js architecture context (client vs. server component)

---
