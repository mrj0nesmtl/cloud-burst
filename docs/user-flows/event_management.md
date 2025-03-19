# Event Management System

## Event Status Management

### Status Types and Transitions
The Cloud Burst platform supports multiple event statuses to track the lifecycle of an event:

- **Draft**: Initial state for newly created events (default)
- **Published**: Event is active and visible to invited attendees
- **Completed**: Event has ended and is in archive mode
- **Cancelled**: Event has been cancelled and is not active

Event organizers can change the status of an event using the status selector component on the event details page. This component provides a dropdown interface with clear descriptions of each status option and email notifications for status changes.

### Status Change Effects
When an event's status changes:

- **Draft to Published**: Makes the event visible to invited attendees, enables QR code scanning, sends notification emails
- **Published to Completed**: Archives the event, disables new uploads, but keeps gallery accessible, sends completion notifications
- **Any Status to Cancelled**: Disables all event functionality except viewing for organizers, sends cancellation notices
- **Cancelled to Draft/Published**: Re-enables event functionality based on the selected status, sends reactivation notices

### Status Visibility
The current status of an event is clearly displayed on:
- Event details page (with status selector for organizers)
- Events listing page (as a badge)
- Dashboard statistics (counted in appropriate category)
- Email notifications (status-specific templates)
- Invitation management interface

## QR Code System

### QR Code Generation
QR codes are automatically generated during event creation and stored in the database. The system:
- Creates a unique QR code URL based on the event ID
- Stores the QR code URL in the `qr_code_url` field of the events table
- Ensures the QR code remains valid throughout the event lifecycle
- Integrates with email templates for invitation delivery
- Supports both personal and event-wide QR codes

### What Happens When Event Details Change
When an organizer edits event details:
- **Custom URL Changes**: If the organizer changes the custom URL of the event, the QR code remains valid because it uses the permanent event ID, not the custom URL. This ensures that existing QR codes continue to work even if the custom URL changes.
- **QR Code Regeneration**: The QR code is not automatically regenerated when event details change. This is intentional to avoid breaking existing QR codes that may have already been printed or distributed.
- **Manual Regeneration**: The QR code page includes a "Regenerate" button that allows organizers to manually create a new QR code if needed. This gives organizers control over when to update their QR codes.
- **Status Changes**: Changing an event's status does not invalidate the QR code, but the functionality may be limited based on the status (e.g., scanning may be disabled for cancelled events).
- **Email Updates**: When significant changes occur, the system can automatically send update notifications using appropriate email templates.

### QR Code Display and Sharing
The QR code page provides several options for organizers:
- **View**: Clear display of the QR code with event details
- **Download**: Save the QR code as an image file for printing or sharing
- **Share**: Send the QR code directly via email using templates
- **Print**: Format the QR code for optimal printing quality
- **Regenerate**: Create a new QR code if needed (with confirmation)
- **Email Preview**: Preview how the QR code appears in email templates

### Best Practices for Event Organizers
Based on how the system is designed, here are some best practices for event organizers:
- **Finalize Custom URL Before Distribution**: It's best to finalize the custom URL before distributing QR codes, even though changing it later won't break existing QR codes.
- **Use Event ID for Permanence**: For critical communications, the event ID-based URL is more permanent and reliable than the custom URL.
- **Regenerate When Needed**: If there's a need to track different versions of QR codes (for example, for different groups of attendees), organizers can use the regenerate button.
- **Publish Events Before Distribution**: Ensure the event is in "Published" status before distributing QR codes to attendees.
- **Consider Status Effects**: Be aware that changing an event to "Cancelled" will affect QR code functionality.
- **Test Email Templates**: Preview and test email templates with QR codes before sending to attendees.
- **Monitor Email Analytics**: Track email delivery and open rates for QR code distributions.

### Technical Implementation
The system is designed with resilience in mind:
- QR codes point to permanent IDs rather than changeable attributes
- The QR code generation happens in the `generateQRCodeUrl` function in `src/lib/qr-code.ts`
- QR codes are automatically generated during event creation in the `createEvent` function
- The system allows manual regeneration but doesn't automatically invalidate existing codes
- Event status changes are managed through the `updateEventStatus` function in `src/lib/supabase/events.ts`
- Email templates are synchronized using the `syncEmailTemplates` function
- Delivery tracking is handled by the `trackEmailDelivery` service

## Attendee Management

### Adding Attendees
Event organizers can add attendees to their events through:
- **Individual Addition**: Using the Add Attendee dialog
- **Bulk Import**: Uploading a CSV file with attendee information
- **Manual Entry**: Directly entering attendee details in the form
- **Email Template Selection**: Choosing appropriate templates for different attendee types

When an attendee is added:
1. Their information is stored in the database
2. An invitation email is automatically sent using the selected template
3. They gain access to the event gallery through the QR code
4. Their email preferences are recorded
5. Their attendance status is tracked

### Attendee Statuses
Attendees can have different statuses in the system:
- **Invited**: Initial state when added to the event
- **Confirmed**: Attendee has confirmed their attendance
- **Declined**: Attendee has declined the invitation
- **Attended**: Attendee has checked in at the event
- **Pending**: Awaiting email verification
- **Blocked**: Access has been revoked

### Attendee Permissions
Based on their role, attendees can:
- View the event gallery
- Upload photos (if enabled by the organizer)
- Upload videos (if enabled by the organizer)
- Download photos (if enabled by the organizer)
- Share photos (if enabled by the organizer)
- Manage email preferences
- Access event-specific features

## Event Settings and Configuration

### Basic Settings
- Event name, date, time, and location
- Event description and details
- Custom URL for easy sharing
- Event type and category
- Email template selection

### Advanced Settings
- Privacy settings (public, private, invitation-only)
- Upload permissions (who can upload photos)
- Download permissions (who can download photos)
- Moderation settings (pre-approval for uploads)
- Notification preferences (email, in-app)
- Email template customization
- Delivery tracking options

### Gallery Settings
- Default view (grid, masonry, slideshow)
- Sorting options (date, popularity)
- Filtering options (tags, photographer)
- Featured photos selection
- Cover photo selection
- Media moderation rules
- Upload size limits