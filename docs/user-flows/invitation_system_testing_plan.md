
# Cloud Burst: Invitation System Testing Plan

## Overview
This document outlines the complete testing workflow for Cloud Burst's invitation system, specifically focusing on event creation, invitation delivery, guest authentication, QR code scanning, and gallery access functionality.

## Prerequisites
- Access to a Cloud Burst organizer account
- At least one test email account to receive invitations
- A device with a camera for QR code scanning
- Ideally a second device to display QR codes for testing

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
4. **Expected outcome**: QR code displayed with proper event attribution

### Phase 3: Invitation Creation and Delivery
1. Navigate to "Invitations" section for your event
2. Select "Create Invitation"
3. Enter recipient email address(es)
4. Add an optional custom message
5. Send invitation(s)
6. **Expected outcome**: 
   - Confirmation message appears
   - Invitation appears in the event's invitation list with "Pending" status
   - Backend logs should show successful creation of guest account

### Phase 4: Email Delivery Verification
1. Access the test email account
2. Locate the invitation email
3. Verify the email contains:
   - Magic login link
   - Event details (name, date, location)
   - RSVP options
   - Fallback authentication link (if magic link fails)
4. **Expected outcome**: All elements present and correctly formatted

### Phase 5: Guest Authentication Testing
1. Click the magic link in the invitation email
2. **Expected outcome**: 
   - Automatic authentication without password entry
   - Redirection to the event gallery
   - Invitation status updates to "Used" in organizer dashboard

### Phase 6: QR Code Authentication Testing
1. From the invitation email, access and display the invitation QR code on a device
2. On a separate device logged in with an organizer account:
   - Navigate to QR scanner page
   - Scan the displayed invitation QR code
3. **Expected outcome**:
   - QR code successfully scanned
   - Guest information displayed
   - Invitation marked as "Confirmed" in system

### Phase 7: Guest Account Functionality
1. Access the system as an authenticated guest
2. Test the following features:
   - Gallery browsing
   - Photo viewing
   - RSVP status changes
   - Photo uploading (if enabled)
3. **Expected outcome**: Guest can perform all allowed actions with appropriate permissions

### Phase 8: RSVP Functionality
1. As a guest user, locate RSVP options
2. Test changing RSVP status (Yes/No/Maybe)
3. Submit changes
4. **Expected outcome**:
   - RSVP status updates in real-time
   - Changes reflect in organizer dashboard
   - Notification sent to organizer (if configured)

### Phase 9: Gallery QR Code Access
1. As an organizer, access and display the event gallery QR code
2. Scan this QR code with the Cloud Burst QR scanner
3. **Expected outcome**: 
   - Universal access to gallery granted
   - No specific invitation required
   - Access logged in system

## Error Handling Verification
Throughout testing, verify these error scenarios:
- Invalid email address handling
- Expired invitation link behavior
- Invitation to already registered user
- QR code scanning with poor lighting/angles
- Network interruption during authentication

## Bug Reporting Format
When reporting issues, please include:
1. Testing phase where issue occurred
2. Steps to reproduce
3. Expected vs. actual outcome
4. Screenshots (if applicable)
5. Device/browser information

---

*Document version: 1.0*  
*Last updated: [Current Date]*
